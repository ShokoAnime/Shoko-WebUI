import { map } from "lodash";
import React, { RefObject } from "react";
import { Grid } from "react-virtualized";

export interface JumpBarProps {
  items: any;
  columns: any;
  gridRef: RefObject<Grid>;
  onJump?: ((key: string) => void) | undefined;
}

const Jumpbar = ({
  items,
  columns,
  gridRef,
  onJump = undefined,
}: JumpBarProps) => {
  if (!items || columns === 0) {
    return null;
  }
  let index = 0;
  return (
    <div className='shrink-0 px-6 pb-9 shrink-0 flex flex-col drop-shadow-[-4px_0_4px_rgba(0,0,0,0.25)]'>
      {map(items, (count, key) => {
        const rowIndex = Math.ceil(index / columns);
        const item = (
          <div
            className='cursor-pointer my-1'
            onClick={() => {
              gridRef?.current?.scrollToCell({ columnIndex: 0, rowIndex });
              if (onJump) onJump(key);
            }}
            key={key}
          >
            {key}
          </div>
        );
        index += count;
        return item;
      })}
    </div>
  );
};

export default React.memo(Jumpbar);
