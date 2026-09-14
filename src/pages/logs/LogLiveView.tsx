import { useEffect, useRef } from 'react';
import { mdiLoading, mdiTextSearch } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { throttle } from 'lodash';

import Button from '@/components/Input/Button';
import LogRow from '@/pages/logs/LogRow';

import type { LogEventType, LogLevelType } from '@/core/react-query/logging/types';

type Props = {
  activeLevels: Set<LogLevelType>;
  logLines: LogEventType[];
  onClearFilters: () => void;
  scrollToBottom: boolean;
  setScrollToBottom: (value: boolean) => void;
};

const LogLiveView = ({ activeLevels, logLines, onClearFilters, scrollToBottom, setScrollToBottom }: Props) => {
  const visibleLines = activeLevels.size === 0
    ? logLines
    : logLines.filter(line => activeLevels.has(line.Level));

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: visibleLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    useFlushSync: false,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  // Magic code stolen from https://github.com/TanStack/virtual/issues/634
  // Fixes autoscroll issue in firefox
  // and now apparently chrome too
  if (parentRef.current) {
    rowVirtualizer.scrollRect = { height: parentRef.current.clientHeight, width: parentRef.current.clientWidth };
  }

  useEffect(() => {
    if (!scrollToBottom || visibleLines.length === 0) return;
    rowVirtualizer.scrollToIndex(visibleLines.length - 1);
  }, [visibleLines, scrollToBottom, rowVirtualizer]);

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
    <div
      className="w-full overflow-y-auto rounded-lg border-16 border-panel-input bg-panel-input font-mono text-sm contain-strict"
      ref={parentRef}
      onScroll={handleScroll}
    >
      {logLines.length === 0 && (
        <div className="flex h-full items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={4} spin />
        </div>
      )}

      {logLines.length > 0 && visibleLines.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-y-2 text-panel-text">
          <Icon path={mdiTextSearch} size={2} className="opacity-50" />
          <div className="font-semibold">No log messages match</div>
          <div className="text-sm opacity-65">Adjust the level filters or clear them.</div>
          <Button buttonType="primary" buttonSize="small" className="mt-2" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {visibleLines.length > 0 && (
        <div
          className="relative w-full"
          style={{ height: rowVirtualizer.getTotalSize() }}
        >
          <div
            className="absolute inset-x-4 top-0"
            style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
          >
            {virtualItems.map(virtualRow => (
              <LogRow
                key={virtualRow.key}
                dataIndex={virtualRow.index}
                event={visibleLines[virtualRow.index]}
                measureRef={rowVirtualizer.measureElement}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogLiveView;
