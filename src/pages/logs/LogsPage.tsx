import React, { useEffect, useRef, useState } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import { useGetLogsQuery } from '@/core/rtkQuery/logsApi';

import { LogLineType } from '@/core/types/api/common';


function LogsPage() {
  const [id] = useState(new Date().getTime());
  const linesQuery = useGetLogsQuery(id);
  const lines: LogLineType[] = linesQuery?.data ?? [];
  const listRef = useRef<List>(null);
  const [isScrollToBottom, setScrollToBottom] = useState(true);

  useEffect(() => {
    if (!isScrollToBottom) { return; }
    listRef?.current?.scrollToRow(lines.length);
  }, [lines, isScrollToBottom]);
  
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 15,
  });

  const handleScrollToBottom = () => {
    setScrollToBottom(!isScrollToBottom);
  };

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
      <div key="logs" className="bg-gray-700 text-white font-mono flex flex-col min-h-full">
        <div className="flex flex-row text-sm text-font-main bg-background-alt items-center">
          <Checkbox id="scroll" isChecked={isScrollToBottom} onChange={handleScrollToBottom} />
          <span className="pl-1">Scroll to bottom</span>
        </div>
        <div className={cx('flex flex-col grow overflow-hidden', lines.length > 0 && 'overflow-y-auto' )}>
        {lines.length === 0 && <span key="empty">Nothing here. Make sure you have server version that supports log streaming.</span>}
        <AutoSizer className="grow">
          {({ width, height }) => (
            <List
              ref={listRef}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              width={width}
              height={height}
              rowRenderer={renderRow}
              rowCount={lines.length}
              overscanRowCount={5}
              scrollToIndex={lines.length}
              scrollToAlignment="end"
            />
          )}
        </AutoSizer>
        </div>
      </div>
    </React.Fragment>
  );
}

export default LogsPage;
