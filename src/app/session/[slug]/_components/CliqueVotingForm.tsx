import React from 'react';
import { Alert, VStack, Text, Button, Card } from "@chakra-ui/react";
import { DndContext } from '@dnd-kit/core';

import { SessionLayout } from "./SessionLayout";
import { DraggableOption } from "./DraggableOption";
import { DroppableBallot } from "./DroppableBallot";

interface Option {
    id: number;
    label: string;
}

interface VotingFormProps {
    token: string;
    options: Option[];
    onSubmit: (selectedIds: number[]) => Promise<void>;
    error?: string;
    loading?: boolean;
    minVotes?: number;
    maxVotes?: number;
}

export function CliqueVotingForm({
    token,
    options,
    onSubmit,
    error,
    loading,
    minVotes = 2,
    maxVotes = options.length
}: VotingFormProps) {
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

                <DndContext>
                    <DraggableOption label="test" />
                    <DroppableBallot order={1} />
                </DndContext>
            </VStack>
        </SessionLayout>)
}