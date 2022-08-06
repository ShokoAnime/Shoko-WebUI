import React from 'react';
import {
  List, AutoSizer, CellMeasurer, CellMeasurerCache,
} from 'react-virtualized';

import { useGetLogsQuery } from '../../core/rtkQuery/logsApi';
import { LogLineType } from '../../core/types/api/common';

function LogsPage() {
  const linesQuery = useGetLogsQuery();
  const lines: LogLineType[] = linesQuery?.data ?? [];

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 15,
  });

  const renderRow = ({
    index, key, parent, style,
  }) => (
    <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
    >
      <div key={key} style={style} className="text-sm bg-dark-gray">
        <div className="content flex flex-row">
          <div className="px-1 text-pink-500 whitespace-nowrap">{lines[index].timeStamp}</div>
          <div className="px-1">{lines[index].message}</div>
        </div>
      </div>
    </CellMeasurer>
  );

  return (
    <React.Fragment>
      <div key="logs" className="bg-gray-700 text-white font-mono min-h-full">
        {lines.length === 0 && <span key="empty">Nothing here. Make sure you have server version that supports log streaming.</span>}
        <AutoSizer>
          {({ width, height }) => (
            <List
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              width={width}
              height={height}
              rowRenderer={renderRow}
              rowCount={lines.length}
              overscanRowCount={0}
              scrollToIndex={lines.length}
            />
          )}
        </AutoSizer>
      </div>
    </React.Fragment>
  );
}

export default LogsPage;
