import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    TouchSensor,
    closestCenter
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
    VStack,
    Text,
    Button,
    Alert,
    Container,
    Box
} from '@chakra-ui/react';
import { SessionLayout } from './SessionLayout';
import { DroppableBallot, type TierConfig } from './DroppableBallot';
import { DraggableOption } from './DraggableOption';

interface Option {
    id: number;
    label: string;
}

export interface TieredOption extends Option {
    order: number;
}

interface CliqueVotingFormProps {
    options: Option[];
    token: string;
    onSubmit: (votes: TieredOption[]) => Promise<void>;
    error?: string;
    loading?: boolean;
    minVotes?: number;
    maxVotes?: number;
}

const votingBallots: TierConfig[] = [{
    tierOrder: 1,
    tierLabel: "موافق بشدة",
}, {
    tierOrder: 2,
    tierLabel: "موافق",
}, {
    tierOrder: 3,
    tierLabel: "لا يوجد لدي مانع"
}, {
    tierOrder: 0,
    tierLabel: "الاختيارات",
}]

export function CliqueVotingForm({
    options,
    onSubmit,
    error,
    loading,
    minVotes = 2,
    maxVotes = options.length
}: CliqueVotingFormProps) {
    const [tieredOptions, setTieredOptions] = useState<TieredOption[]>([]);
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setTieredOptions(
            options.map(option => ({
                ...option,
                order: 0,
            }))
        );
    }, [options]);

    // Configure sensors with appropriate activation constraints
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require a more intentional drag to begin
            activationConstraint: {
                distance: 8, // 8px of movement required before drag starts
            },
        }),
        useSensor(TouchSensor, {
            // Add a delay and distance constraint for touch devices
            activationConstraint: {
                delay: 250, // ms delay before drag starts
                tolerance: 5, // px tolerance before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Prevent page scrolling when dragging
    useEffect(() => {
        if (!isDragging) return;
        
        // Save the current body style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        // Prevent scrolling on the body
        document.body.style.overflow = 'hidden';
        
        // Restore original style when dragging stops
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isDragging]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setIsDragging(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setIsDragging(false);
        const { active, over } = event;

        if (!over) return;

        const optionId = parseInt(active.id as string);
        const targetTier = over.id as number;

        // Count how many options are already ranked (not in Unranked tier)
        const rankedCount = tieredOptions.filter(o => o.order !== 0).length;

        // If moving from Unranked to a ranked tier and we've reached maxVotes
        if (
            targetTier !== 0 &&
            getOptionTier(optionId) === 0 &&
            rankedCount >= maxVotes
        ) {
            console.log('maximum voting reached');
            return;
        }

        setTieredOptions(prev =>
            prev.map(option =>
                option.id === optionId
                    ? { ...option, order: targetTier }
                    : option
            )
        );
    };

    const getOptionTier = (optionId: number): number => {
        const option = tieredOptions.find(o => o.id === optionId);
        return option ? option.order : 0;
    };

    const getOptionsForTier = (tierOrder: number) => {
        return tieredOptions.filter(option => option.order === tierOrder);
    };

    const handleSubmit = () => {
        if (loading) return;

        const selectedOptions = tieredOptions.filter(option => option.order !== 0);

        console.log(selectedOptions)

        if (selectedOptions.length < minVotes) {
            setValidationError(`Please rank at least ${minVotes} options`);
            return;
        }

        if (selectedOptions.length > maxVotes) {
            setValidationError(`You can rank at most ${maxVotes} options`);
            return;
        }

        onSubmit(selectedOptions);
    };

    const activeOption = activeId ? tieredOptions.find(option => option.id === activeId) : null;

    return (
        <SessionLayout title="Rank Your Options">
            <Container maxW="container.md" py={4}>
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
                        Please rank between {minVotes} and {maxVotes} options by dragging them to the appropriate tier.
                    </Text>

                    {/* TODO: temporary message, remove */}
                    <Text direction="rtl" fontWeight="bold">
                        الرجاء التصويت لنفسك ولأسرة طه في خانة موافق بشدة
                    </Text>

                    <Box>
                        <Text fontWeight="bold" mb={2}>
                            Ranked: {tieredOptions.filter(option => option.order !== 0).length}/{maxVotes}
                        </Text>
                    </Box>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {votingBallots.map((ballot) => (
                            <DroppableBallot key={ballot.tierOrder} id={ballot.tierOrder} tierConfig={ballot}>
                                {getOptionsForTier(ballot.tierOrder).map((option) => (
                                    <DraggableOption
                                        key={option.id}
                                        id={option.id}
                                        label={option.label}
                                    />
                                ))}
                            </DroppableBallot>
                        ))}

                        <DragOverlay>
                            {activeId && activeOption ? (
                                <DraggableOption
                                    id={activeOption.id}
                                    label={activeOption.label}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        loading={loading}
                        loadingText="Submitting..."
                        disabled={tieredOptions.filter(option => option.order !== 0).length < minVotes || loading}
                        colorScheme="blue"
                        mt={4}
                    >
                        Submit Vote
                    </Button>
                </VStack>
            </Container>
        </SessionLayout>
    );
}