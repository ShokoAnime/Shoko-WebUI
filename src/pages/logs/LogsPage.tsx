import React, { useEffect, useRef, useState } from 'react';
import { mdiArrowVerticalLock, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { throttle } from 'lodash';

import IconButton from '@/components/Input/IconButton';
import { useLogsQuery } from '@/core/react-query/logs/queries';

const LogsPage = () => {
  const logLines = useLogsQuery().data;
  const [scrollToBottom, setScrollToBottom] = useState(true);

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: logLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  // Magic code stolen from https://github.com/TanStack/virtual/issues/634
  // Fixes autoscroll issue in firefox
  // and now apparently chrome too
  if (parentRef.current) {
    rowVirtualizer.scrollRect = { height: parentRef.current.clientHeight, width: parentRef.current.clientWidth };
  }

  useEffect(() => {
    if (!rowVirtualizer || !scrollToBottom || logLines.length === 0) return;
    rowVirtualizer.scrollToIndex(logLines.length - 1);
  }, [logLines, scrollToBottom, rowVirtualizer]);

  // Taken from ChatGPT...
  // Disables auto scroll when user scrolls up
  const checkScrollDirection = useRef(
    throttle(() => {
      if (!parentRef.current) return;
      const currentScroll = parentRef.current.scrollTop;

      setTimeout(() => {
        if (parentRef.current && parentRef.current.scrollTop < currentScroll) setScrollToBottom(false);
      }, 50);
    }, 1000),
  ).current;

  // This exists because the value of scrollToBottom won't change inside checkScrollDirection
  const handleScroll = () => {
    if (scrollToBottom) checkScrollDirection();
  };

  return (
    <>
      <title>Logs | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background p-6">
          <div className="text-xl font-semibold">Logs</div>
          <div className="flex gap-x-2">
            {/* TODO: Disabled until functionality is implemented */}
            {/* <Input */}
            {/*   id="search" */}
            {/*   onChange={event => setSearch(event.target.value)} */}
            {/*   type="text" */}
            {/*   value={search} */}
            {/*   placeholder="Search Logs..." */}
            {/*   startIcon={mdiMagnify} */}
            {/*   className="w-80" */}
            {/*   disabled */}
            {/* /> */}
            {/* <IconButton icon={mdiFilterOutline} buttonType="secondary" buttonSize="normal" tooltip="Filter"/> */}
            {/* <IconButton icon={mdiCogOutline} buttonType="secondary" buttonSize="normal" tooltip="Settings"/> */}
            <IconButton
              icon={mdiArrowVerticalLock}
              buttonType="secondary"
              buttonSize="normal"
              className={cx(scrollToBottom ? 'text-panel-text-primary' : '!text-panel-text')}
              onClick={() => setScrollToBottom(prev => !prev)}
              tooltip={`${scrollToBottom ? 'Disable' : 'Enable'} scroll to bottom`}
            />
          </div>
        </div>

        <div className="flex grow rounded-lg border border-panel-border bg-panel-background p-6">
          <div
            className="w-full overflow-y-auto rounded-lg border-16 border-panel-input bg-panel-input contain-strict"
            ref={parentRef}
            onScroll={handleScroll}
          >
            {logLines.length === 0
              ? (
                <div className="flex h-full items-center justify-center text-panel-text-primary">
                  <Icon path={mdiLoading} size={4} spin />
                </div>
              )
              : (
                <div
                  className="relative w-full"
                  style={{ height: rowVirtualizer.getTotalSize() }}
                >
                  <div
                    className="absolute left-4 top-0 w-[95%]"
                    style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
                  >
                    {virtualItems.map((virtualRow) => {
                      const row = logLines[virtualRow.index];
                      return (
                        <div
                          className="flex gap-x-6 pt-2"
                          key={virtualRow.key}
                          data-index={virtualRow.index}
                          ref={rowVirtualizer.measureElement}
                        >
                          <div className="w-44 shrink-0 opacity-65">{row.TimeStamp}</div>
                          <div className="w-[2.8rem] shrink-0">{row.Level}</div>
                          <div className="break-all">{row.Message}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LogsPage;
