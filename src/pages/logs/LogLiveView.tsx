import { useEffect, useRef } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';

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
  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
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

  // Disables auto scroll when the user scrolls up. While locked, the only way the
  // container stops being at the bottom is a user scroll — the programmatic
  // scrollToIndex always lands at the bottom, and the virtualizer's measurement
  // corrections keep it there.
  const handleScroll = () => {
    const container = parentRef.current;
    if (!scrollToBottom || !container) return;
    if (container.scrollHeight - container.scrollTop - container.clientHeight > 1) setScrollToBottom(false);
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
