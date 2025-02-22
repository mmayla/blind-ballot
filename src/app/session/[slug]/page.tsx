'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Option {
  id: number;
  label: string;
}

interface Result {
  optionId: number;
  label: string;
  voteCount: number;
}

export default function SessionPage() {
  const { slug } = useParams();
  const [token, setToken] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [isVerified, setIsVerified] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [sessionState, setSessionState] = useState<'initiated' | 'configured' | 'finished'>('initiated');

  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        // First try to get session results
        const resultsResponse = await fetch(`/api/sessions/${slug}/results`);
        if (resultsResponse.ok) {
          const data = await resultsResponse.json();
          setResults(data.results || []);
          setSessionState('finished');
          return;
        }

        // If not finished, try to get options
        const optionsResponse = await fetch(`/api/sessions/${slug}/options`);
        if (optionsResponse.ok) {
          const data = await optionsResponse.json();
          setOptions(data.options || []);
          setSessionState('configured');
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
    };

    checkSessionStatus();
  }, [slug]);

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
      if (data.valid) {
        setIsVerified(true);
      } else {
        throw new Error('Invalid token');
      }
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
        throw new Error('Failed to submit vote');
      }

      setIsVoted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote');
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionState === 'finished') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Voting Results</h1>
        <div className="space-y-4">
          {results && results.map((result) => (
            <div key={result.optionId} className="p-4 bg-surface-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{result.label}</span>
                <span className="text-sm">{result.voteCount} votes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isVoted) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          Your vote has been submitted successfully!
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Enter Voting Token</h1>
        {error && <div className="text-error mb-4">{error}</div>}
        <div className="space-y-4">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token"
            className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
          />
          <button
            onClick={verifyToken}
            className="btn w-full border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
            disabled={!token.trim() || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Token'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select Options</h1>
      {error && <div className="text-error mb-4">{error}</div>}
      <div className="space-y-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedOptions.has(option.id)
                ? 'bg-content-primary text-surface-primary'
                : 'bg-surface-secondary hover:bg-surface-elevated'
            }`}
          >
            {option.label}
          </div>
        ))}
        <button
          onClick={submitVote}
          className="btn w-full mt-4"
          disabled={selectedOptions.size < 2 || isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Vote'}
        </button>
      </div>
    </div>
  );
}
