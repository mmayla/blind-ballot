'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredToken, storeToken, removeToken } from '@/lib/auth';
import { decryptTokens } from '@/lib/token';
import {
  Box,
  Container,
  VStack,
  Heading,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { AdminAuth } from './_components/AdminAuth';
import { ApprovalAdmin } from './_components/ApprovalAdmin';
import { CliqueAdmin } from './_components/CliqueAdmin';

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
  used: boolean;
  salt?: string;
  iv?: string;
  ciphertext?: string;
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
  const [sessionType, setSessionType] = useState<'approval' | 'clique'>('approval');
  const [minVotes, setMinVotes] = useState<number>(0);
  const [maxVotes, setMaxVotes] = useState<number>(0);

  const verifyWithToken = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/sessions/${slug}/verify-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
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
  }, [slug]);

  const fetchSessionData = useCallback(async () => {
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
      setSessionType(sessionData.session.type);
      setMinVotes(sessionData.session.minVotes);
      setMaxVotes(sessionData.session.maxVotes);

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
          if (data.tokens[0].salt && data.tokens[0].iv) {
            const decryptedTokens = await decryptTokens(data.tokens, password);
            setVotingTokens(decryptedTokens);
          } else {
            setVotingTokens(data.tokens);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      setError('Failed to fetch session data');
    }
  }, [authToken, slug, password]);

  useEffect(() => {
    let storedToken = getStoredToken(slug as string);

    if (sessionType === 'clique' && !password) {
      // TODO: ugly find a better way to make sure the password is in the state
      setIsVerified(false)
      storedToken = 'invalid-token';
    }

    if (storedToken) {
      verifyWithToken(storedToken);
    }
  }, [slug, password, sessionType, verifyWithToken]);

  useEffect(() => {
    if (authToken) {
      fetchSessionData();
    }
  }, [authToken, slug, fetchSessionData]);

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

  const configureApprovalSession = async () => {
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
      const response = await fetch(`/api/sessions/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          minVotes,
          maxVotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? 'Failed to configure session')
      }
    } catch (error) {
      console.error('Error configuring session:', error);
      setError('Failed to configure session');
      setIsLoading(false);
      return;
    }

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

  const configureCliqueSession = async () => {
    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      setError('Please add at least 2 valid options');
      return;
    }

    if (minVotes > maxVotes) {
      setError('Minimum votes cannot be greater than maximum votes');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/sessions/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          minVotes,
          maxVotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? 'Failed to configure session')
      }
    } catch (error) {
      console.error('Error configuring session:', error);
      setError('Failed to configure session');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${slug}/clique-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          options: validOptions,
          adminPassword: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save options');
      }

      const data = await response.json();

      const decryptedTokens = await decryptTokens(data.tokens, password);
      setVotingTokens(decryptedTokens);

      setSessionState('configured');
    } catch (error) {
      console.error('Error saving options:', error);
      setError('Failed to configure session');
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

  if (isLoading && !isVerified) {
    return (
      <Box minH="100vh" py={20}>
        <Center>
          <Spinner size="xl" />
        </Center>
      </Box>
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
    <Box minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack align="stretch" gap={4}>
          <Heading as="h1" size="2xl">Session Admin</Heading>

          {sessionType === 'approval' ? (
            <ApprovalAdmin
              slug={slug as string}
              sessionState={sessionState}
              options={options}
              setOptions={setOptions}
              numberOfVoters={numberOfVoters}
              setNumberOfVoters={setNumberOfVoters}
              votingTokens={votingTokens}
              isLoading={isLoading}
              error={error}
              configureSession={configureApprovalSession}
              closeVoting={closeVoting}
              minVotes={minVotes}
              maxVotes={maxVotes}
              onMinVotesChange={setMinVotes}
              onMaxVotesChange={setMaxVotes}
            />
          ) : (
            <CliqueAdmin
              slug={slug as string}
              sessionState={sessionState}
              options={options}
              setOptions={setOptions}
              votingTokens={votingTokens}
              isLoading={isLoading}
              error={error}
              configureSession={configureCliqueSession}
              closeVoting={closeVoting}
              minVotes={minVotes}
              maxVotes={maxVotes}
              onMinVotesChange={setMinVotes}
              onMaxVotesChange={setMaxVotes}
              adminPassword={password}
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
}
