import React from 'react';

const ItemCount = ({ count, series = false }: { count: number, series?: boolean }) => (
  <div className="text-xl font-semibold">
    <span className="text-panel-text-important">
      {count}
      &nbsp;
    </span>
    {series && 'Series'}
    {!series && (count === 1 ? 'File' : 'Files')}
  </div>
);

export default ItemCount;
