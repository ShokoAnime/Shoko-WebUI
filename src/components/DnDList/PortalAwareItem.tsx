import React from 'react';
import ReactDOM from 'react-dom';
import type { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

const portal: HTMLElement = document.createElement('div');
document.body.appendChild(portal);

type Props = {
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot,
  children: React.ReactNode,
};

class PortalAwareItem extends React.Component<Props> {
  render() {
    const { children, provided, snapshot } = this.props;

    const usePortal: boolean = snapshot.isDragging;

    const child: JSX.Element = (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        {children}
      </div>
    );

    return usePortal ? ReactDOM.createPortal(child, portal) : child;
  }
}

export default PortalAwareItem;
