'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Option {
  id: number;
  label: string;
}

export default function SessionPage() {
  const { slug } = useParams();
  const [token, setToken] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVoted, setIsVoted] = useState(false);

  const verifyToken = async () => {
    if (!token.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setOptions(data.options);
      setIsVerified(true);
    } catch (error) {
      console.error('Error verifying token:', error);
      setError('Invalid or already used token');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOption = (optionId: number) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const submitVote = async () => {
    if (isLoading || selectedOptions.size < 2) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          optionIds: Array.from(selectedOptions),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsVoted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVoted) {
    return (
      <div className="min-h-screen bg-surface-primary p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary text-center">
            <h1 className="text-2xl font-bold text-content-primary mb-4">Thank You!</h1>
            <p className="text-content-secondary">Your vote has been recorded successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-content-primary mb-6">Voting Session</h1>
        <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary">
          {error && (
            <div className="text-error mb-4 p-4 bg-surface-elevated rounded-lg">
              {error}
            </div>
          )}

          {!isVerified ? (
            <div className="form-control">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                placeholder="Enter your voting token"
                className="input input-bordered w-full bg-surface-elevated text-content-primary border-border-secondary focus:border-border-primary mb-4"
                onKeyDown={(e) => e.key === 'Enter' && verifyToken()}
              />
              <button
                onClick={verifyToken}
                disabled={!token.trim() || isLoading}
                className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors w-full"
              >
                {isLoading ? 'Verifying...' : 'Continue to Vote'}
              </button>
            </div>
          ) : (
            <>
              <div className="alert alert-warning mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <h3 className="font-bold">Important!</h3>
                  <div className="text-sm">
                    - You must select at least 2 options<br />
                    - Your vote cannot be changed after submission<br />
                    - This token can only be used once
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {options.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-secondary hover:bg-surface-elevated cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOptions.has(option.id)}
                      onChange={() => toggleOption(option.id)}
                      className="checkbox"
                    />
                    <span className="text-content-primary">{option.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={submitVote}
                disabled={isLoading || selectedOptions.size < 2}
                className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors w-full"
              >
                {isLoading ? 'Submitting...' : 'Submit Vote'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
