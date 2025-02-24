import { Box, Heading, VStack, Text, Card } from '@chakra-ui/react';

interface Option {
  id?: number;
  label: string;
}

interface OptionsListProps {
  options: Option[];
}

export function OptionsList({ options }: OptionsListProps) {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Options</Heading>
      <VStack gap={2} align="stretch">
        {options.map((option, index) => (
          <Card.Root key={index} variant="outline">
            <Card.Body>
              <Text fontSize="xl" fontWeight="medium">{option.label}</Text>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );
}
