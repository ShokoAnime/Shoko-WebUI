import { useEffect, useRef } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { throttle } from 'lodash';

import useVirtualizerScrollRectWorkaround from '@/hooks/useVirtualizerScrollRectWorkaround';
import LogRow from '@/pages/logs/LogRow';

import type { LogEventType } from '@/core/react-query/logging/types';

type Props = {
  logLines: LogEventType[];
  scrollToBottom: boolean;
  setScrollToBottom: (value: boolean) => void;
};

const LogLiveView = ({ logLines, scrollToBottom, setScrollToBottom }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: logLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    useFlushSync: false,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  useVirtualizerScrollRectWorkaround(rowVirtualizer, parentRef);

  useEffect(() => {
    if (!scrollToBottom || logLines.length === 0) return;
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

      {logLines.length > 0 && (
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
                event={logLines[virtualRow.index]}
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
