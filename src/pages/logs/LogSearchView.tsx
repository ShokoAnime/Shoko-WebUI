import { useEffect, useRef } from 'react';
import { mdiLoading, mdiTextSearch } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';

import Button from '@/components/Input/Button';
import { useLogsSearchQuery } from '@/core/react-query/logging/queries';
import useVirtualizerScrollRectWorkaround from '@/hooks/useVirtualizerScrollRectWorkaround';
import LogRow from '@/pages/logs/LogRow';

import type { LogLevelType } from '@/core/react-query/logging/types';

// DSL grammar the server accepts (LogService.TryParseLogFilterDsl): a mode char first — c: contains,
// =: equals, ^: starts, $: ends, ~: fuzzy, *: regex — optionally followed by at most one ! (negate)
// and one # (case-insensitive) in either order, then ':'. ! and # are modifiers, never prefixes on
// their own (e.g. "!c:foo" or "#:foo" are server-side 400s). A bare value is shorthand for "c:"
// (case-sensitive contains), so we make it case-insensitive by default unless the user typed valid
// DSL themselves; anything else gets wrapped as a literal.
const hasDslPrefix = (value: string) => /^[c=^$~*](?:!#|#!|!|#)?:/.test(value);

const toServerSearch = (value: string) => (!value || hasDslPrefix(value) ? value : `c#:${value}`);

type Props = {
  activeLevels: Set<LogLevelType>;
  onClearFilters: () => void;
  search: string;
};

const LogSearchView = ({ activeLevels, onClearFilters, search }: Props) => {
  const serverSearch = toServerSearch(search);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useLogsSearchQuery({
    search: serverSearch,
    levels: activeLevels,
  });

  const logEntries = data?.pages.flatMap(page => page.Entries) ?? [];

  const searching = isFetching && logEntries.length === 0;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: logEntries.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    useFlushSync: false,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  // Trigger the next page fetch from an effect on the trailing virtual row instead of a
  // render-phase side effect; fetchNextPage has stable identity so no debounce is needed.
  const lastVirtualItem = virtualItems[virtualItems.length - 1];
  const lastVirtualIndex = lastVirtualItem?.index;
  useEffect(() => {
    if (lastVirtualIndex === logEntries.length && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [lastVirtualIndex, hasNextPage, isFetchingNextPage, fetchNextPage, logEntries.length]);

  useVirtualizerScrollRectWorkaround(rowVirtualizer, parentRef);

  return (
    <div
      className="w-full overflow-y-auto rounded-lg border-16 border-panel-input bg-panel-input font-mono text-sm contain-strict"
      ref={parentRef}
    >
      {searching && (
        <div className="flex h-full flex-col items-center justify-center gap-y-2 text-panel-text">
          <Icon path={mdiLoading} size={2} spin className="text-panel-icon-action" />
          <div className="font-semibold">Searching server logs...</div>
          <div className="text-sm opacity-65">This covers the full log history, not just the live tail.</div>
        </div>
      )}

      {!searching && !isFetching && logEntries.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-y-2 text-panel-text">
          <Icon path={mdiTextSearch} size={2} className="opacity-50" />
          <div className="font-semibold">No server log entries match your search.</div>
          <div className="text-sm opacity-65">Try different keywords or clear the filters.</div>
          <Button buttonType="primary" buttonSize="small" className="mt-2" onClick={onClearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {logEntries.length > 0 && (
        <div className="flex flex-col">
          <div
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            <div
              className="absolute inset-x-4 top-0"
              style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
            >
              {virtualItems.map((virtualRow) => {
                const event = logEntries[virtualRow.index];

                if (!event) {
                  return (
                    <div
                      key={virtualRow.key}
                      className="flex items-center justify-center py-4"
                      ref={rowVirtualizer.measureElement}
                    >
                      <Icon path={mdiLoading} size={1} spin className="text-panel-icon-action" />
                    </div>
                  );
                }

                return (
                  <LogRow
                    key={virtualRow.key}
                    dataIndex={virtualRow.index}
                    event={event}
                    measureRef={rowVirtualizer.measureElement}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogSearchView;
