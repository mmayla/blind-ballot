import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  HStack,
  IconButton,
} from '@chakra-ui/react';

import { X, Plus } from 'lucide-react';

interface Option {
  id?: number;
  label: string;
}

interface OptionsManagerProps {
  options: Option[];
  onUpdateOption: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export function OptionsManager({
  options,
  onUpdateOption,
  onAddOption,
  onRemoveOption
}: OptionsManagerProps) {
  return (
    <Box>
      <Heading as="h2" size="md" mb={4}>Configure Options</Heading>
      <VStack gap={2} align="stretch">
        {options.map((option, index) => (
          <HStack key={index}>
            <Input
              value={option.label}
              onChange={(e) => onUpdateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              size="md"
            />
            <IconButton
              onClick={() => onRemoveOption(index)}
              aria-label="Remove option"
              disabled={options.length <= 1}
              size="md"
            >
              <X />
            </IconButton>
          </HStack>
        ))}
      </VStack>
      <Button
        onClick={onAddOption}
        mt={3}
        size="md"
        variant="outline"
      >
        <Plus /> Add Option
      </Button>
    </Box>
  );
}
