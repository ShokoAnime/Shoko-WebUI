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
      ref={provided.innerRef}
      {...(provided.draggableProps)}
      {...(provided.dragHandleProps)}
      className="group"
    >
      {children}
    </div>
  );

  return usePortal ? ReactDOM.createPortal(child, portal) : child;
};

export default PortalAwareItem;
