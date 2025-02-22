'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredToken, storeToken, removeToken } from '@/lib/auth';
import { CopyableLink } from '@/components/shared/CopyableLink';
import { OptionsManager } from './_components/OptionsManager';
import { TokenList } from './_components/TokenList';
import { VoterCount } from './_components/VoterCount';
import { AdminAuth } from './_components/AdminAuth';
import { OptionsList } from './_components/OptionsList';

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
  used: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const { slug } = useParams();
  const [authToken, setAuthToken] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<Option[]>([{ label: '' }]);
  const [numberOfVoters, setNumberOfVoters] = useState(2);
  const [votingTokens, setVotingTokens] = useState<Token[]>([]);
  const [sessionState, setSessionState] = useState<'initiated' | 'configured' | 'finished'>('initiated');

  useEffect(() => {
    const storedToken = getStoredToken(slug as string);
    if (storedToken) {
      verifyWithToken(storedToken);
    }
  }, [slug]);

  useEffect(() => {
    if (authToken) {
      fetchSessionData();
    }
  }, [authToken, slug]);

  const fetchSessionData = async () => {
    try {
      const sessionResponse = await fetch(`/api/sessions/${slug}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to fetch session data');
      }

      const sessionData = await sessionResponse.json();
      setSessionState(sessionData.session.state);

      if (sessionData.session.state !== 'initiated') {
        const optionsResponse = await fetch(`/api/sessions/${slug}/options`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (optionsResponse.ok) {
          const data = await optionsResponse.json();
          setOptions(data.options);
        }

        const tokensResponse = await fetch(`/api/sessions/${slug}/tokens`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (tokensResponse.ok) {
          const data = await tokensResponse.json();
          setVotingTokens(data.tokens);
        }
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      setError('Failed to fetch session data');
    }
  };

  const verifyWithToken = async (token: string) => {
    try {
      const sessionResponse = await fetch(`/api/sessions/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!sessionResponse.ok) {
        removeToken(slug as string);
        return;
      }

      setAuthToken(token);
      setIsVerified(true);
      storeToken(slug as string, token);
    } catch (error) {
      console.error('Error verifying token:', error);
      removeToken(slug as string);
    }
  };

  const verifyPassword = async () => {
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();
      setAuthToken(data.jwtToken);
      setIsVerified(true);
      storeToken(slug as string, data.jwtToken);
    } catch (error) {
      console.error('Error verifying password:', error);
      setError('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  const saveOptions = async () => {
    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      setError('Please add at least 2 valid options');
      return;
    }

    if (numberOfVoters < 2) {
      setError('Number of voters must be at least 2');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          options: validOptions,
          numberOfVoters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save options');
      }

      const data = await response.json();
      setVotingTokens(data.tokens);
      setSessionState('configured');
      router.refresh();
    } catch (error) {
      console.error('Error saving options:', error);
      setError('Failed to save options');
    } finally {
      setIsLoading(false);
    }
  };

  const closeVoting = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to close voting');
      }

      router.push(`/session/${slug}`);
    } catch (error) {
      console.error('Error closing voting:', error);
      setError('Failed to close voting');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isLoading && !isVerified) {
    return (
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-content-primary"></div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <AdminAuth
        error={error}
        isLoading={isLoading}
        password={password}
        onPasswordChange={setPassword}
        onVerify={verifyPassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Session Admin</h1>
        {error && <div className="text-error mb-4">{error}</div>}
        {sessionState === 'initiated' ? (
          <div className="space-y-6">
            <OptionsManager
              options={options}
              onUpdateOption={(index, value) => {
                const newOptions = [...options];
                newOptions[index] = { ...newOptions[index], label: value };
                setOptions(newOptions);
              }}
              onAddOption={() => setOptions([...options, { label: '' }])}
              onRemoveOption={(index) => setOptions(options.filter((_, i) => i !== index))}
            />

            <VoterCount
              value={numberOfVoters}
              onChange={setNumberOfVoters}
            />

            <button
              onClick={saveOptions}
              className="btn w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        ) : (
          <>
            <CopyableLink
              className='mb-7'
              label="Voting Page"
              url={`${window.location.origin}/session/${slug}`}
            />

            <OptionsList
              className='mb-7'
              options={options}
            />

            <TokenList
              className='mb-7'
              tokens={votingTokens}
              onCopyToken={copyToClipboard}
            />

            <div className="flex justify-center">
              {sessionState === "configured" && (
                <button
                  onClick={closeVoting}
                  className="btn w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Closing...' : 'Close Voting & Show Results'}
                </button>
              )}

              {sessionState === 'finished' && (
                <button
                  onClick={() => router.push(`/session/${slug}`)}
                  className="btn btn-primary"
                >
                  View Results
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
