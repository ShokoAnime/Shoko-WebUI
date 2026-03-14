import React from 'react';

import TreeNode from '@/components/TreeView/TreeNode';

const TreeView = () => (
  <div className="h-111 w-full overflow-x-hidden overflow-y-auto">
    <ul>
      <TreeNode path="Shoko Server" nodeId={0} level={1} />
    </ul>
  </div>
);

export default TreeView;
