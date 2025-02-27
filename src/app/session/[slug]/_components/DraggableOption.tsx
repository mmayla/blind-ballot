import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, Text } from '@chakra-ui/react';

type DraggableOptionProps = {
    id: number;
    label: string;
    disabled?: boolean;
}

export function DraggableOption({ id, label, disabled = false }: DraggableOptionProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id.toString(),
        disabled,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        marginBottom: '8px',
    } : {
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        marginBottom: '8px',
        cursor: disabled ? 'not-allowed' : 'grab',
    };

    return (
        <Card.Root
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={disabled ? '' : 'blue.800'}
            _hover={disabled ? {} : { bg: 'blue.800' }}
            transition="all 0.2s"
        >
            <Text fontSize="md" fontWeight="medium" textAlign="center">
                {label}
            </Text>
        </Card.Root>
    );
}