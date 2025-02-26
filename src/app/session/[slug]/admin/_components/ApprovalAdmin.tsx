import { useRouter } from 'next/navigation';
import {
  VStack,
  Button,
  Box,
  Alert,
  Heading,
  Text
} from '@chakra-ui/react';
import { CopyableLink } from '@/components/shared/CopyableLink';
import { OptionsManager } from './OptionsManager';
import { VoterCount } from './VoterCount';
import { OptionsList } from './OptionsList';
import { TokenList } from './TokenList';
import { SessionManager } from './SessionManager';

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
  used: boolean;
}

interface ApprovalAdminProps {
  slug: string;
  sessionState: 'initiated' | 'configured' | 'finished';
  options: Option[];
  setOptions: (options: Option[]) => void;
  numberOfVoters: number;
  setNumberOfVoters: (count: number) => void;
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

export function ApprovalAdmin({
  slug,
  sessionState,
  options,
  setOptions,
  numberOfVoters,
  setNumberOfVoters,
  votingTokens,
  isLoading,
  error,
  configureSession,
  closeVoting,
  minVotes,
  maxVotes,
  onMinVotesChange,
  onMaxVotesChange,
}: ApprovalAdminProps) {
  const router = useRouter();

  return (
    <VStack gap={4} align="stretch">
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      <Heading size="md">Approval Session</Heading>
      <Text mb={7}>In an approval session, vote for multiple options and results are shown by the total number of votes for each option.</Text>

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

          <VoterCount
            value={numberOfVoters}
            onChange={setNumberOfVoters}
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
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/session/${slug}`}
          />

          <OptionsList options={options} />

          <TokenList
            tokens={votingTokens}
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
