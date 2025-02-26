import {
    VStack,
    HStack,
    Heading,
    Text,
    Box,
} from '@chakra-ui/react';

import {
    NumberInputField,
    NumberInputRoot,
} from "@/components/ui/number-input"

import { Field } from "@/components/ui/field"


interface SessionManagerProps {
    minVotes?: number;
    maxVotes?: number;
    onMinVotesChange: (value: number) => void;
    onMaxVotesChange: (value: number) => void;
}

export function SessionManager({
    minVotes,
    maxVotes,
    onMinVotesChange,
    onMaxVotesChange,
}: SessionManagerProps) {
    return (
        <Box>
            <VStack gap={4} align="stretch">
                <Heading as="h2" size="md">Session Settings</Heading>
                <Text>Configure the minimum and maximum number of votes allowed per voter. Keep both zero to allow unlimited votes.</Text>
                <HStack gap={4}>
                    <Field label="Minimum Votes">
                        <NumberInputRoot
                            w="full"
                            min={0}
                            value={minVotes ? minVotes.toString() : '0'}
                            onValueChange={(e) => onMinVotesChange(e.valueAsNumber)}
                        >
                            <NumberInputField />
                        </NumberInputRoot>
                    </Field>
                    <Field label="Maximum Votes">
                        <NumberInputRoot
                            w="full"
                            min={minVotes ?? 0}
                            value={maxVotes ? maxVotes.toString() : '0'}
                            onValueChange={(e) => onMaxVotesChange(e.valueAsNumber)}
                        >
                            <NumberInputField />
                        </NumberInputRoot>
                    </Field>
                </HStack>
            </VStack>
        </Box>
    );
}