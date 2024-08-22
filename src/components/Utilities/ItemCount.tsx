import React from 'react';

const ItemCount = ({ count, selected, suffix }: { count: number, selected?: number, suffix?: string }) => (
  <div className="text-lg font-semibold">
    <span>
      <span className="text-panel-text-important">
        {count}
        &nbsp;
      </span>
      {suffix && suffix}
      {!suffix && (count === 1 ? 'File' : 'Files')}
    </span>
    {(selected ?? 0) > 0 && (
      <>
        <span>&nbsp;|&nbsp;</span>
        <span>
          <span className="text-panel-text-important">
            {selected ?? 0}
            &nbsp;
          </span>
          {suffix && suffix}
          Selected
        </span>
      </>
    )}
  </div>
);

export default ItemCount;
