import { map } from 'lodash';
import React from 'react';

const Jumpbar = ({ items, columns, gridRef }) => {
  if (!items || columns === 0) {
    return null;
  }
  let index = 0;
  return (
    <div
      className="shrink-0 px-6 pb-9 shrink-0 flex flex-col drop-shadow-[-4px_0_4px_rgba(0,0,0,0.25)]">
      {map(items, (count, key) => {
        const rowIndex = Math.ceil(index / columns);
        const item = <div className="cursor-pointer my-1" onClick={() => {
          gridRef?.current?.scrollToCell({ columnIndex: 0, rowIndex });
        }} key={key}>{key}</div>;
        index += count;
        return item;
      })}
    </div>
  );
};

export default React.memo(Jumpbar);