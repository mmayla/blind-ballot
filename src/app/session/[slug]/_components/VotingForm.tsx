import { VStack, Text, Button, Alert, Card } from '@chakra-ui/react';
import { SessionLayout } from './SessionLayout';
import { useState } from 'react';

interface Option {
  id: number;
  label: string;
}

interface VotingFormProps {
  options: Option[];
  onSubmit: (selectedIds: number[]) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function VotingForm({ options, onSubmit, error, loading }: VotingFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());

  const toggleOption = (optionId: number) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  const handleSubmit = () => {
    if (loading || selectedOptions.size < 2) return;
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
          disabled={selectedOptions.size < 2}
          colorScheme="blue"
        >
          Submit Vote
        </Button>
      </VStack>
    </SessionLayout>
  );
}
