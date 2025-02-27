'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Alert } from '@chakra-ui/react';
import { Results } from './_components/Results';
import { TokenVerification } from './_components/TokenVerification';
import { ApprovalVotingForm } from './_components/ApprovalVotingForm';
import { SessionLayout } from './_components/SessionLayout';
import { CliqueVotingForm, TieredOption } from './_components/CliqueVotingForm';
import { shuffleArray } from '@/utils/array';

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
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [sessionType, setSessionType] = useState<'approval' | 'clique'>('approval');
  const [sessionState, setSessionState] = useState<'initiated' | 'configured' | 'finished'>('initiated');
  const [minVotes, setMinVotes] = useState<number>(2);
  const [maxVotes, setMaxVotes] = useState<number | undefined>(undefined);

  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        // First try to get session results
        const resultsResponse = await fetch(`/api/sessions/${slug}/approval-results`);
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
          const shuffledOptions = shuffleArray<Option>(data.options || []);
          setOptions(shuffledOptions);
          setSessionState('configured');
        }

        const sessionResponse = await fetch(`/api/sessions/${slug}`);
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          if (data.session) {
            setSessionType(data.session.type);
            setMinVotes(data.session.minVotes ?? 2);
            setMaxVotes(data.session.maxVotes ?? undefined);
          }
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
    };

    checkSessionStatus();
  }, [slug]);

  // Check for token in URL when the component mounts
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl && !isVerified && !isVoted && sessionState === 'configured') {
      const decodedToken = decodeURIComponent(tokenFromUrl);
      verifyToken(decodedToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isVerified, isVoted, sessionState]);

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

  const submitApprovalVote = async (selectedOptionIds: number[]) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/approval-vote`, {
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

  const submitCliqueVote = async (votes: TieredOption[]) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}/clique-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          votes,
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
  }

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
        initialToken={searchParams.get('token') || ''}
      />
    );
  }

  if (sessionType === 'approval') {
    return (
      <ApprovalVotingForm
        options={options}
        onSubmit={submitApprovalVote}
        error={error}
        loading={loading}
        minVotes={minVotes}
        maxVotes={maxVotes}
      />
    );
  }

  if (sessionType === 'clique') {
    return (
      <CliqueVotingForm
        token={token}
        options={options}
        onSubmit={submitCliqueVote}
        error={error}
        loading={loading}
        minVotes={minVotes}
        maxVotes={maxVotes}
      />);
  }

  return (<div>unknown session type</div>);
}
