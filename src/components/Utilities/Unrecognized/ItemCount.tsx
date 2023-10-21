import React from 'react';

const ItemCount = ({ filesCount, series = false }: { filesCount: number, series?: boolean }) => (
  <div className="text-xl font-semibold">
    <span className="text-panel-text-important">
      {filesCount}
      &nbsp;
    </span>
    {series ? 'Series' : 'Files'}
  </div>
);

export default ItemCount;
