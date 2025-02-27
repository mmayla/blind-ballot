import {
  VStack,
  Button,
  Box,
  Alert,
  Text,
  Heading
} from '@chakra-ui/react';
import { CopyableLink } from '@/components/shared/CopyableLink';
import { OptionsManager } from './OptionsManager';
import { TokenList } from './TokenList';
import { SessionManager } from './SessionManager';
import { CliqueResults } from './CliqueResults';
import { getStoredToken } from '@/lib/auth';

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
  ciphertext?: string;
  used: boolean;
}

interface CliqueAdminProps {
  slug: string;
  sessionState: 'initiated' | 'configured' | 'finished';
  setSessionState: (sessionState: 'initiated' | 'configured' | 'finished') => void;
  options: Option[];
  setOptions: (options: Option[]) => void;
  votingTokens: Token[];
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
  configureSession: () => Promise<void>;
  closeVoting: () => Promise<void>;
  minVotes?: number;
  maxVotes?: number;
  onMinVotesChange: (value: number) => void;
  onMaxVotesChange: (value: number) => void;
  adminPassword: string;
}

export function CliqueAdmin({
  slug,
  sessionState,
  setSessionState,
  options,
  setOptions,
  votingTokens,
  isLoading,
  setIsLoading,
  error,
  setError,
  configureSession,
  minVotes,
  maxVotes,
  onMinVotesChange,
  onMaxVotesChange,
  adminPassword,
}: CliqueAdminProps) {

  const closeVoting = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const authToken = getStoredToken(slug);
      const response = await fetch(`/api/sessions/${slug}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to close voting');
      }

      setSessionState('finished');
    } catch (error) {
      console.error('Error closing voting:', error);
      setError('Failed to close voting');
    } finally {
      setIsLoading(false);
    }
  };

  const votingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/session/${slug}`;

  return (
    <VStack gap={4} align="stretch">
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      <Heading size="md">Clique Voting Session</Heading>
      <Text mb={7}>In a clique voting session, participants can distribute votes among themselves with different weights.</Text>

      {sessionState === 'initiated' ? (
        <VStack gap={7} align="stretch">
          <SessionManager
            minVotes={minVotes}
            maxVotes={maxVotes}
            onMinVotesChange={onMinVotesChange}
            onMaxVotesChange={onMaxVotesChange}
          />

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

          <Button
            colorScheme="blue"
            size="lg"
            onClick={configureSession}
            loading={isLoading}
            disabled={isLoading}
          >
            Save Configuration
          </Button>
        </VStack>
      ) : (
        <VStack gap={7} align="stretch">
          <CopyableLink
            label="Voting Page"
            url={votingUrl}
          />

          <TokenList
            tokens={parseVotingTokens(votingTokens)}
            votingUrl={votingUrl}
          />

          {sessionState === "configured" && (
            <Box textAlign="center">
              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                onClick={closeVoting}
                loading={isLoading}
                loadingText="Closing..."
                disabled={isLoading}
              >
                Close Voting & Show Results
              </Button>
            </Box>
          )}

          {sessionState === 'finished' && (
            <CliqueResults slug={slug} adminPassword={adminPassword} />
          )}
        </VStack>
      )}
    </VStack>
  );
}

const parseVotingTokens = (tokens: Token[]) => {
  return tokens.map((token) => {
    const [, label] = token.token.split(':');
    return {
      token: token.ciphertext || '',
      used: token.used,
      label: label,
    };
  });
};