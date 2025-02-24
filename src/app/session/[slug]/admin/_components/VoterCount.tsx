import {
  Box,
  Heading,
} from '@chakra-ui/react';

import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input"

interface VoterCountProps {
  value: number;
  onChange: (value: number) => void;
}

export function VoterCount({ value, onChange }: VoterCountProps) {
  return (
    <Box>
      <Heading as="h2" size="md" mb={2}>Number of Voters</Heading>
      <NumberInputRoot
        min={2}
        defaultValue='2'
        value={value.toString()}
        onValueChange={(e) => onChange(e.valueAsNumber)}
        size="md"
      >
        <NumberInputField />
      </NumberInputRoot>
    </Box>
  );
}
