import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';

import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

type Props = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  children: ReactNode;
};

const PortalAwareItem = (props: Props) => {
  const { children, provided, snapshot } = props;

  const usePortal: boolean = snapshot.isDragging;

  const child: ReactNode = (
    <div
      // Attaching these refs/props during render is the documented contract of
      // @hello-pangea/dnd's DraggableProvided — the library requires it to measure items.
      // oxlint-disable-next-line react/refs -- ref/props come from @hello-pangea/dnd's DraggableProvided
      ref={provided.innerRef}
      {
        // oxlint-disable-next-line react/refs -- ref/props come from @hello-pangea/dnd's DraggableProvided
        ...(provided.draggableProps)
      }
      {
        // oxlint-disable-next-line react/refs -- ref/props come from @hello-pangea/dnd's DraggableProvided
        ...(provided.dragHandleProps)
      }
      className="group"
    >
      {children}
    </div>
  );

  return usePortal ? ReactDOM.createPortal(child, portal) : child;
};

export default PortalAwareItem;
