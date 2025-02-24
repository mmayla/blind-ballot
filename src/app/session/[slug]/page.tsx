'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Alert } from '@chakra-ui/react';
import { Results } from './_components/Results';
import { TokenVerification } from './_components/TokenVerification';
import { VotingForm } from './_components/VotingForm';
import { SessionLayout } from './_components/SessionLayout';

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
  const [isVerified, setIsVerified] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const verifyToken = async (tokenValue: string) => {
    setLoading(true);
    setError('');
    setToken(tokenValue);

    try {
      const response = await fetch(`/api/sessions/${slug}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue }),
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
      setLoading(false);
    }
  };

  const submitVote = async (selectedOptionIds: number[]) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          optionIds: selectedOptionIds,
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
      setLoading(false);
    }
  };

  if (sessionState === 'finished') {
    return <Results results={results} />;
  }

  if (isVoted) {
    return (
      <SessionLayout title="Vote Submitted">
        <Alert.Root status="success">
          <Alert.Description>
            Your vote has been submitted successfully!
          </Alert.Description>
        </Alert.Root>
      </SessionLayout>
    );
  }

  if (!isVerified) {
    return (
      <TokenVerification
        onVerify={verifyToken}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <VotingForm
      options={options}
      onSubmit={submitVote}
      error={error}
      loading={loading}
    />
  );
}
