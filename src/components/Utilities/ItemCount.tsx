import React from 'react';

const ItemCount = ({ count, selected, series = false }: { count: number, selected?: number, series?: boolean }) => (
  <div className="text-lg font-semibold">
    <span>
      <span className="text-panel-text-important">
        {count}
        &nbsp;
      </span>
      {series && 'Series'}
      {!series && (count === 1 ? 'File' : 'Files')}
    </span>
    {(selected ?? 0) > 0 && (
      <>
        <span>&nbsp;|&nbsp;</span>
        <span>
          <span className="text-panel-text-important">
            {selected ?? 0}
            &nbsp;
          </span>
          {series && 'Series'}
          Selected
        </span>
      </>
    )}
  </div>
);

export default ItemCount;
