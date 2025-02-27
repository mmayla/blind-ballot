import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Flex, Text } from '@chakra-ui/react';

export type TierConfig = {
    tierOrder: number;
    tierLabel: string;
}

type DroppableBallotProps = {
    id: string | number;
    tierConfig: TierConfig;
    children?: ReactNode;
};

const tierColors: Record<number, string> = {
    0: 'gray.600', // unranked
    1: 'red.500',
    2: 'orange.500',
    3: 'yellow.500',
};

const getTierColor = (tierOrder: number): string => {
    if (tierColors[tierOrder]) {
        return tierColors[tierOrder];
    }
    return 'green.500';
};

export function DroppableBallot({ id, tierConfig, children }: DroppableBallotProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <Box
            ref={setNodeRef}
            mb={4}
            width="100%"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={isOver ? 'blue.500' : 'gray.300'}
            borderRadius="md"
            bg={isOver ? 'blue.500' : ''}
            transition="all 0.2s"
            minHeight="80px"
            p={2}
        >
            <Flex alignItems="center" mb={2}>
                <Box
                    bg={getTierColor(tierConfig.tierOrder)}
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontWeight="bold"
                    mr={2}
                >
                    {tierConfig.tierOrder}
                </Box>
                <Text fontWeight="medium">
                    {tierConfig.tierLabel}
                </Text>
            </Flex>
            <Box>
                {children}
            </Box>
        </Box>
    );
}