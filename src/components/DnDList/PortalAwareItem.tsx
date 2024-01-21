import React from 'react';
import type { JSX } from 'react';
import ReactDOM from 'react-dom';

import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

type Props = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  children: React.ReactNode;
};

function PortalAwareItem(props: Props) {
  const usePortal: boolean = props.snapshot.isDragging;

  const child: JSX.Element = (
    <div
      ref={props.provided.innerRef}
      {...(props.provided.draggableProps)}
      {...(props.provided.dragHandleProps)}
      className="group"
    >
      {props.children}
    </div>
  );

  return usePortal ? ReactDOM.createPortal(child, portal) : child;
}

export default PortalAwareItem;
