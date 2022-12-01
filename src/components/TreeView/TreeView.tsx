import React from 'react';
import RootNode from './RootNode';

let id = 0;
export const getNextId = () => ++id;

function TreeView() {
  return (
    <div className="treeview w-full shoko-scrollbar">
      <ul className="list-group">
        <RootNode Path="Shoko Server" />
      </ul>
    </div>
  );
}

export default TreeView;
