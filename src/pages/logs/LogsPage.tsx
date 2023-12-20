import React, { useEffect, useMemo, useState } from 'react';
import { mdiArrowVerticalLock, mdiCogOutline, mdiFilterOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { useLogsQuery } from '@/core/react-query/logs/queries';

const LogsPage = () => {
  const logsQuery = useLogsQuery();
  const logLines = useMemo(() => logsQuery.data ?? [], [logsQuery]);
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
  }, [logLines.length, isScrollToBottom, rowVirtualizer]);

  return (
    <div className="flex grow flex-col gap-y-8">
      <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-background px-8 py-4">
        <div className="text-xl font-semibold">Logs</div>
        <div className="flex items-center gap-x-4">
          <Input
            id="search"
            onChange={e => setSearch(e.target.value)}
            type="text"
            value={search}
            placeholder="Search Logs..."
            startIcon={mdiMagnify}
            className="w-80"
            disabled
          />
          <Button buttonType="secondary" className="px-5 py-2" disabled>
            <Icon path={mdiFilterOutline} size={1} />
          </Button>
          <Button buttonType="secondary" className="px-5 py-2" disabled>
            <Icon path={mdiCogOutline} size={1} />
          </Button>
          {/* TODO: To be moved into settings modal */}
          <Button
            buttonType="secondary"
            className={cx('px-5 py-2', isScrollToBottom ? 'text-panel-text-primary' : '!text-panel-text')}
            onClick={() => setScrollToBottom(prev => !prev)}
          >
            <Icon path={mdiArrowVerticalLock} size={1} />
          </Button>
        </div>
      </div>

      <div className="flex grow rounded-md border border-panel-border bg-panel-background p-8">
        <div className="w-full rounded-md border border-panel-border bg-panel-input py-4 pr-4">
          <div className="relative h-full grow overflow-y-auto bg-panel-input" ref={parentRef}>
            {(logsQuery.isLoading || logLines.length === 0)
              ? (
                <div className="flex h-full grow items-center justify-center">
                  <Icon path={mdiLoading} size={4} className="text-panel-text-primary" spin />
                </div>
              )
              : (
                <div className="absolute top-0 w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
                  <div
                    className="absolute left-4 w-[95%] space-y-1"
                    style={{ transform: `translateY(${virtualItems[0].start}px)` }}
                  >
                    {virtualItems.map((virtualRow) => {
                      const row = logLines[virtualRow.index];
                      return (
                        <div
                          className="flex gap-x-8"
                          key={virtualRow.key}
                          data-index={virtualRow.key}
                          ref={rowVirtualizer.measureElement}
                        >
                          <div className="w-[11.5rem] shrink-0 opacity-50">{row.timeStamp}</div>
                          <div className="w-[2.8rem] shrink-0">{row.level}</div>
                          <div>{row.message}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
