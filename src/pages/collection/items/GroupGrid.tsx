import { AutoSizer, Grid, WindowScroller } from 'react-virtualized';
import React from 'react';

type Props = {
  mode: string;
  cellRenderer(cols: number): ({ columnIndex, key, rowIndex, style }: { columnIndex: any, key: any, rowIndex: any, style: any }) => (JSX.Element | null);
  total: number;
};

const itemWidth = 225; //209 + 16
const itemHeight = 349; //333 + 16
const itemHeightList = 240; //176 + 16 + 16

const GroupGrid = ({ mode, cellRenderer, total }: Props) => (
  <WindowScroller>
    {({ height, isScrolling, onChildScroll, scrollTop }) =>
      <AutoSizer disableHeight>
        {({ width }) => {
          //Adding one extra gap to account for the fact that first item does not have it
          const gridColumns = mode === 'grid' ? Math.floor((width + 16) / itemWidth) : 1;
          const rows = mode === 'grid' ? Math.ceil(total / gridColumns) : total;
          if (gridColumns <= 0) { return null; }
          return (
            <Grid
              className="grow"
              overscanRowCount={1}
              columnCount={gridColumns}
              rowCount={rows}
              columnWidth={mode === 'grid' ? itemWidth : width - 32}
              autoHeight
              height={height}
              rowHeight={mode === 'grid' ? itemHeight : itemHeightList}
              width={width}
              cellRenderer={cellRenderer(gridColumns)}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
            />
          );
        }}
      </AutoSizer>
    }
  </WindowScroller>
);

export default GroupGrid;