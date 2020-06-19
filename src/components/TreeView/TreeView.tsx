import React from 'react';
import TreeNode from './TreeNode';

class TreeView extends React.Component<{}> {
  render() {
    return (
      <div className="treeview w-full">
        <ul className="list-group">
          <TreeNode
            basePath=""
            nodeId={0}
            level={1}
            text="Shoko Server"
          />
        </ul>
      </div>
    );
  }
}

export default TreeView;
