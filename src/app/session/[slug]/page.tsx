'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Progress,
  Alert,
  Card,
  Flex,
} from '@chakra-ui/react';

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
  const [loading, setloading] = useState(false);
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
    if (!token.trim() || loading) return;

    setloading(true);
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
      setloading(false);
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
    if (loading || selectedOptions.size < 2) return;

    setloading(true);
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
      setloading(false);
    }
  };

  if (sessionState === 'finished') {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="4xl">
          <VStack align="stretch" gap={4}>
            <Heading size="2xl">Voting Results</Heading>
            <VStack align="stretch" gap={4}>
              {results && [...results]
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((result) => {
                  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
                  const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;

                  return (
                    <Card.Root key={result.optionId} variant="outline">
                      <Card.Body>
                        <VStack align="stretch" gap={2}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xl" fontWeight="medium">{result.label}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {result.voteCount} vote{result.voteCount !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                            </Text>
                          </Flex>
                          <Progress.Root>
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  );
                })}
            </VStack>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Total Votes: {results.reduce((sum, r) => sum + r.voteCount, 0)}
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (isVoted) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="4xl">
          <Alert.Root status="success">
            <Alert.Description>
              Your vote has been submitted successfully!
            </Alert.Description>
          </Alert.Root>
        </Container>
      </Box>
    );
  }

  if (!isVerified) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="4xl">
          <VStack align="stretch" gap={4}>
            <Heading size="2xl">Enter Voting Token</Heading>
            {error && (
              <Alert.Root status="error">
                <Alert.Description>
                  {error}
                </Alert.Description>
              </Alert.Root>
            )}
            <Input
              size="xl"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your token"
            />
            <Button
              size="lg"
              onClick={verifyToken}
              loading={loading}
              loadingText="Verifying..."
              disabled={!token.trim()}
              colorScheme="blue"
            >
              Verify Token
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="4xl">
        <VStack align="stretch" gap={4}>
          <Heading size="2xl">Select Options</Heading>
          {error && (
            <Alert.Root status="error">
              <Alert.Description>
                {error}
              </Alert.Description>
            </Alert.Root>
          )}
          <VStack align="stretch" gap={4}>
            {options.map((option) => (
              <Card.Root
                key={option.id}
                onClick={() => toggleOption(option.id)}
                cursor="pointer"
                bg={selectedOptions.has(option.id) ? 'green.500' : undefined}
                _hover={{ bg: selectedOptions.has(option.id) ? 'green.600' : 'gray.900' }}
                transition="all 0.2s"
                variant="outline"
              >
                <Card.Body>
                  <Text
                    fontSize="xl"
                    color={selectedOptions.has(option.id) ? 'white' : undefined}
                  >
                    {option.label}
                  </Text>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
          <Button
            size="lg"
            onClick={submitVote}
            loading={loading}
            loadingText="Submitting..."
            disabled={selectedOptions.size < 2}
            colorScheme="blue"
          >
            Submit Vote
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
