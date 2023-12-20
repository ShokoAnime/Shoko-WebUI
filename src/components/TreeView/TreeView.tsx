import React from 'react';

import TreeNode from '@/components/TreeView/TreeNode';

function TreeView() {
  return (
    <div className="h-[27.75rem] w-full overflow-y-auto overflow-x-hidden">
      <ul>
        <TreeNode path="Shoko Server" nodeId={0} level={1} />
      </ul>
    </div>
  );
}

export default TreeView;
