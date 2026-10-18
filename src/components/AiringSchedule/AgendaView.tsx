import type { RefObject } from 'react';
import { useOutletContext } from 'react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import { RowEntry } from '@/components/AiringSchedule/AiringEntries';
import { pxPerRem } from '@/core/util';
import { getAgendaRows } from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';
import type { AgendaRowType } from '@/core/utilities/airingSchedule';

type Props = {
  end: Dayjs;
  entries: Map<string, CalendarEntryType[]>;
  now: Dayjs;
  start: Dayjs;
};

// The rows have fixed heights, in rem: a day's heading and the space below it, an entry, and the space after a day.
const headingHeight = 2.1;
const entryHeight = 5.5;
const dayGap = 1.5;

const getRowHeight = (row: AgendaRowType) =>
  (row.type === 'day' ? headingHeight : entryHeight)
  + (row.isDayEnd ? dayGap : 0);

const AgendaView = ({ end, entries, now, start }: Props) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  const rows = getAgendaRows(start, end, entries);

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: index => rows[index].key,
    estimateSize: index => getRowHeight(rows[index]) * pxPerRem,
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    // The list starts below the page's toolbar, which the virtualizer does not count.
    overscan: 10,
  });

  return (
    <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
          >
            {row.type === 'day'
              ? (
                <div className={cx('font-semibold', row.day.isSame(now, 'day') && 'text-panel-text-primary')}>
                  {row.day.format('dddd, MMMM D')}
                  {row.day.isSame(now, 'day') && <span className="opacity-65">&nbsp;(Today)</span>}
                </div>
              )
              : <RowEntry entry={row.entry} isStriped={row.isStriped} now={now} />}
          </div>
        );
      })}
    </div>
  );
};

export default AgendaView;
