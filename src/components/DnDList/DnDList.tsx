import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type {
  DraggableProvided, DroppableProvided, DraggableStateSnapshot, DropResult,
} from 'react-beautiful-dnd';

import PortalAwareItem from './PortalAwareItem';

type Props = {
  onDragEnd: (result: DropResult) => void;
  children: Array<{ key: string, item: React.ReactNode }>;
};

function DnDList(props: Props) {
  const { onDragEnd, children } = props;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided: DroppableProvided) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className="flex-grow"
          >
            {children.map((child, index) => (
              <Draggable
                key={child.key}
                draggableId={child.key}
                index={index}
              >
                {(
                  draggableProvided: DraggableProvided,
                  draggableSnapshot: DraggableStateSnapshot,
                ) => (
                  <PortalAwareItem
                    provided={draggableProvided}
                    snapshot={draggableSnapshot}
                  >
                    {child.item}
                  </PortalAwareItem>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default DnDList;
