import React, { useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Icon } from '@mdi/react';
import { mdiArrowVerticalLock, mdiCogOutline, mdiFilterOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import cx from 'classnames';

import { useGetLogsQuery } from '@/core/rtkQuery/logsApi';
import { LogLineType } from '@/core/types/api/common';
import Input from '@/components/Input/Input';
import Button from '@/components/Input/Button';

const LogsPage = () => {
  const [id] = useState(new Date().getTime());
  const logsQuery = useGetLogsQuery(id);
  const logLines: LogLineType[] = logsQuery?.data ?? [];
  const [isScrollToBottom, setScrollToBottom] = useState(true);
  const [search, setSearch] = useState('');

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: logLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (!isScrollToBottom || logLines.length === 0) return;
    rowVirtualizer.scrollToIndex(logLines.length - 1, { align: 'start' }); // 'start' scrolls to end and 'end' scrolls to start. ¯\_(ツ)_/¯
  }, [logLines.length, isScrollToBottom]);

  return (
    <div className="flex flex-col gap-y-8 grow">
      <div className="flex justify-between bg-background-alt border border-background-border rounded-md px-8 py-4 items-center">
        <div className="text-xl font-semibold">Logs</div>
        <div className="flex gap-x-4 items-center">
          <Input id="search" onChange={e => setSearch(e.target.value)} type="text" value={search} placeholder="Search Logs..." startIcon={mdiMagnify} className="w-80" disabled />
          <Button className="bg-background-nav border border-background-border px-5 py-2 text-font-main" disabled>
            <Icon path={mdiFilterOutline} size={1} />
          </Button>
          <Button className="bg-background-nav border border-background-border px-5 py-2 text-font-main" disabled>
            <Icon path={mdiCogOutline} size={1} />
          </Button>
          {/* TODO: To be moved into settings modal */}
          <Button className={cx('bg-background-nav border border-background-border px-5 py-2', isScrollToBottom ? 'text-highlight-1' : 'text-font-main')} onClick={() => setScrollToBottom(prev => !prev)}>
            <Icon path={mdiArrowVerticalLock} size={1} />
          </Button>
        </div>
      </div>

      <div className="flex bg-background-alt border border-background-border rounded-md p-8 grow">
        <div className="bg-background-border rounded-md grow overflow-y-auto relative" ref={parentRef}>
          {(logsQuery.isLoading || logLines.length === 0) ? (
            <div className="flex grow justify-center items-center h-full">
              <Icon path={mdiLoading} size={4} className="text-highlight-1" spin />
            </div>
          ) : (
            <div className="absolute w-full top-0" style={{ height: rowVirtualizer.getTotalSize() }}>
              <div className="absolute top-4 left-4" style={{ transform: `translateY(${virtualItems[0].start}px)` }}>
                {virtualItems.map((virtualRow) => {
                  const row = logLines[virtualRow.index];
                  return (
                    <div
                      className="flex gap-x-8"
                      key={virtualRow.key}
                      data-index={virtualRow.key}
                      ref={rowVirtualizer.measureElement}
                    >
                      <div className="shrink-0 w-[11.5rem] opacity-50">{row.timeStamp}</div>
                      <div className="shrink-0 w-[2.8rem]">{row.level}</div>
                      <div>{row.message}</div>
                    </div>
                  );
                })}
                <div className="w-full py-2" /> {/* For bottom padding */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
