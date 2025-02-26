import { VStack, Text, Button, Alert, Card } from '@chakra-ui/react';
import { SessionLayout } from './SessionLayout';
import { useState, useEffect } from 'react';

interface Option {
  id: number;
  label: string;
}

interface VotingFormProps {
  options: Option[];
  onSubmit: (selectedIds: number[]) => Promise<void>;
  error?: string;
  loading?: boolean;
  minVotes?: number;
  maxVotes?: number;
}

export function VotingForm({
  options,
  onSubmit,
  error,
  loading,
  minVotes = 2,
  maxVotes = options.length
}: VotingFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [validationError, setValidationError] = useState<string>('');

  let validMinVotes = minVotes;
  let validMaxVotes = maxVotes;
  if (maxVotes === 0) {
    validMinVotes = 2;
    validMaxVotes = options.length;
  }

  useEffect(() => {
    setValidationError('');
  }, [selectedOptions]);

  const toggleOption = (optionId: number) => {
    const newSelected = new Set(selectedOptions);

    // If already selected, remove it
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    }
    // If not selected and haven't reached max, add it
    else if (newSelected.size < validMaxVotes) {
      newSelected.add(optionId);
    }
    // If trying to select more than max allowed
    else {
      setValidationError(`You can select at most ${validMaxVotes} options`);
      return;
    }

    setSelectedOptions(newSelected);
  };

  const handleSubmit = () => {
    if (loading) return;

    if (selectedOptions.size < validMinVotes) {
      setValidationError(`Please select at least ${validMinVotes} options`);
      return;
    }

    if (selectedOptions.size > validMaxVotes) {
      setValidationError(`You can select at most ${validMaxVotes} options`);
      return;
    }

    onSubmit(Array.from(selectedOptions));
  };

  return (
    <SessionLayout title="Select Options">
      <VStack align="stretch" gap={4}>
        {error && (
          <Alert.Root status="error">
            <Alert.Description>
              {error}
            </Alert.Description>
          </Alert.Root>
        )}

        {validationError && (
          <Alert.Root status="warning">
            <Alert.Description>
              {validationError}
            </Alert.Description>
          </Alert.Root>
        )}

        <Text>
          Please select between {validMinVotes} and {validMaxVotes} options.
        </Text>

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
          onClick={handleSubmit}
          loading={loading}
          loadingText="Submitting..."
          disabled={selectedOptions.size < validMinVotes || loading}
          colorScheme="blue"
        >
          Submit Vote ({selectedOptions.size}/{validMaxVotes} selected)
        </Button>
      </VStack>
    </SessionLayout>
  );
}
