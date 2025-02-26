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

interface Option {
  id?: number;
  label: string;
}

interface Token {
  token: string;
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
  saveOptions: () => Promise<void>;
  closeVoting: () => Promise<void>;
}

export function CliqueAdmin({
  slug,
  sessionState,
  options,
  setOptions,
  votingTokens,
  isLoading,
  error,
  saveOptions,
  closeVoting,
}: CliqueAdminProps) {
  const router = useRouter();

  return (
    <VStack gap={4} align="stretch">
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      <Heading size="md">Clique Voting Session</Heading>
      <Text>In a clique voting session, participants can distribute votes among themselves with different weights.</Text>

      {sessionState === 'initiated' ? (
        <VStack gap={6} align="stretch">
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
            onClick={saveOptions}
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
