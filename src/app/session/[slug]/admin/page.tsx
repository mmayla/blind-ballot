'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredToken, storeToken, removeToken } from '@/lib/auth';

interface Option {
  id?: number;
  label: string;
}

export default function AdminPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [options, setOptions] = useState<Option[]>([{ label: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionState, setSessionState] = useState<'initiated' | 'configured' | 'finished'>('initiated');
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const storedToken = getStoredToken(slug as string);
    if (storedToken) {
      verifyWithToken(storedToken);
    }
  }, [slug]);

  const verifyWithToken = async (token: string) => {
    setIsLoading(true);
    setError('');

    try {
      const sessionResponse = await fetch(`/api/sessions/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!sessionResponse.ok) {
        throw new Error('Invalid token');
      }

      const sessionData = await sessionResponse.json();
      setSessionState(sessionData.session.state);
      setAuthToken(token);
      setIsVerified(true);

      if (sessionData.session.state === 'configured') {
        const optionsResponse = await fetch(`/api/sessions/${slug}/options`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          setOptions(optionsData.options);
        }
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      removeToken(slug as string);
      setError('');
    } finally {
      setIsLoading(false);
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
      setSessionState(data.session.state);
      setAuthToken(data.jwtToken);
      setIsVerified(true);

      storeToken(slug as string, data.jwtToken);

      if (data.session.state === 'configured') {
        const optionsResponse = await fetch(`/api/sessions/${slug}/options`, {
          headers: {
            'Authorization': `Bearer ${data.jwtToken}`,
          },
        });
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          setOptions(optionsData.options);
        }
      }
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

  const updateOption = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label };
    setOptions(newOptions);
  };

  const saveOptions = async () => {
    if (isLoading) return;

    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      setError('Please add at least 2 valid options');
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save options');
      }

      setSessionState('configured');
      router.refresh();
    } catch (error) {
      console.error('Error saving options:', error);
      setError('Failed to save options');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isVerified) {
    return (
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-md mx-auto text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-content-primary mb-6">Admin Access</h1>
          <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary">
            {error && (
              <div className="text-error mb-4 p-4 bg-surface-elevated rounded-lg">
                {error}
              </div>
            )}

            <div className="form-control">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter session password"
                className="input input-bordered w-full bg-surface-elevated text-content-primary border-border-secondary focus:border-border-primary mb-4"
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
              />
              <button
                onClick={verifyPassword}
                disabled={!password.trim() || isLoading}
                className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors w-full"
              >
                {isLoading ? 'Verifying...' : 'Access Admin Panel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionState === 'configured') {
    return (
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-content-primary mb-6">Session Configuration</h1>
          <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary">
            <p className="text-content-primary mb-4">
              This session has been configured and is ready for voting.
            </p>
            <h2 className="text-xl font-semibold text-content-primary mb-4">Options:</h2>
            <ul className="list-disc list-inside text-content-secondary">
              {options.map((option, index) => (
                <li key={index} className="mb-2">{option.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-content-primary mb-6">Configure Session</h1>
        <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary">
          {error && (
            <div className="text-error mb-4 p-4 bg-surface-elevated rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="input input-bordered flex-1 bg-surface-elevated text-content-primary border-border-secondary focus:border-border-primary"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="btn btn-square btn-outline border-border-secondary text-content-secondary hover:bg-surface-elevated"
                  disabled={options.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={addOption}
              className="btn btn-outline border-border-primary text-content-primary"
            >
              Add Option
            </button>
            <button
              onClick={saveOptions}
              disabled={isLoading || options.filter(opt => opt.label.trim()).length < 2}
              className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
