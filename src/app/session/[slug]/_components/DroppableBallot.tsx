import React from 'react';
import { useDroppable } from '@dnd-kit/core';

type DroppableBallotProps = {
    order: number;
};

export function DroppableBallot({ order }: DroppableBallotProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };


    return (
        <div ref={setNodeRef} style={style}>
            {order}
        </div>
    );
}