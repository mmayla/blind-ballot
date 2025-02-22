'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredToken, storeToken, removeToken } from '@/lib/auth';

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
  used: boolean;
}

export default function AdminPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [options, setOptions] = useState<Option[]>([{ label: '' }]);
  const [numberOfVoters, setNumberOfVoters] = useState<number>(2);
  const [votingTokens, setVotingTokens] = useState<Token[]>([]);
  const [password, setPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [sessionState, setSessionState] = useState<'initiated' | 'configured' | 'finished'>('initiated');

  // Initial setup when component mounts
  useEffect(() => {
    const storedToken = getStoredToken(slug as string);
    if (storedToken) {
      verifyWithToken(storedToken);
    }
  }, [slug]);

  // Fetch session data whenever auth state changes
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
      // First verify if the token is still valid by trying to fetch session data
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

  const addOption = () => {
    setOptions([...options, { label: '' }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label: value };
    setOptions(newOptions);
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
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Verify Password</h1>
          {error && <div className="text-error mb-4">{error}</div>}
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
            />
            <button
              onClick={verifyPassword}
              className="btn w-full border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
              disabled={!password.trim() || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Session Admin</h1>
        {error && <div className="text-error mb-4">{error}</div>}

        <div className="space-y-6">
          {sessionState === 'initiated' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Configure Options</h2>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="input input-bordered flex-1 bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className="btn btn-square btn-error"
                        disabled={options.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addOption} className="btn btn-outline mt-2">
                  Add Option
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">Number of Voters</h2>
                <input
                  type="number"
                  min="2"
                  value={numberOfVoters}
                  onChange={(e) => setNumberOfVoters(parseInt(e.target.value) || 2)}
                  className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
                />
              </div>

              <button
                onClick={saveOptions}
                className="btn w-full border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold mb-4">Options</h2>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="p-4 bg-surface-secondary rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Voting Tokens</h2>
                <div className="grid grid-cols-2 gap-4">
                  {votingTokens.map((token, index) => (
                    <div
                      key={index}
                      className={"p-4 bg-surface-secondary rounded-lg flex justify-between items-center"}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono">{token.token}</span>
                        <span className={`text-sm ${!token.used && 'text-green-500'}`}>
                          {token.used ? 'Used' : 'Available'}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(token.token)}
                        className="btn btn-sm"
                        disabled={token.used}
                        title={token.used ? 'Token already used' : 'Copy token'}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-7">
                {sessionState === "configured" && (
                  <button
                    onClick={closeVoting}
                    className="btn btn-error"
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
    </div>
  );
}
