import { useRouter } from 'next/navigation';
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
import { OptionsList } from './OptionsList';
import { TokenList } from './TokenList';
import { SessionManager } from './SessionManager';

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
  options: Option[];
  setOptions: (options: Option[]) => void;
  votingTokens: Token[];
  isLoading: boolean;
  error: string;
  configureSession: () => Promise<void>;
  closeVoting: () => Promise<void>;
  minVotes?: number;
  maxVotes?: number;
  onMinVotesChange: (value: number) => void;
  onMaxVotesChange: (value: number) => void;
}

export function CliqueAdmin({
  slug,
  sessionState,
  options,
  setOptions,
  votingTokens,
  isLoading,
  error,
  configureSession,
  closeVoting,
  minVotes,
  maxVotes,
  onMinVotesChange,
  onMaxVotesChange,
}: CliqueAdminProps) {
  const router = useRouter();

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

          <OptionsList options={options} />

          <TokenList
            tokens={parseVotingTokens(votingTokens)}
            votingUrl={votingUrl}
          />

          <Box textAlign="center">
            {sessionState === "configured" && (
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
            )}

            {sessionState === 'finished' && (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => router.push(`/session/${slug}`)}
              >
                View Results
              </Button>
            )}
          </Box>
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