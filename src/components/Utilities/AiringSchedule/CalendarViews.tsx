import { useState } from 'react';
import type { RefObject } from 'react';
import { useOutletContext } from 'react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import AiringEntry from '@/components/Utilities/AiringSchedule/AiringEntry';
import { FadeIn, SkeletonBlock, SkeletonFade } from '@/components/Utilities/AiringSchedule/Skeleton';
import { pxPerRem } from '@/core/util';
import { DAY_KEY_FORMAT, getAgendaRows, getPeriodDays } from '@/core/utilities/airingSchedule';
import { getOffsetIn } from '@/core/utilities/scroll';
import useNow from '@/hooks/useNow';

import type { HideChannelHandler } from '@/components/Utilities/AiringSchedule/AiringEntry';
import type { AgendaRowType, CalendarEntryType } from '@/core/utilities/airingSchedule';
import type { Dayjs } from 'dayjs';

type ViewProps = {
  date: Dayjs;
  /** The period's airings are loading, so each day shows a skeleton in their place. */
  loading?: boolean;
  /** Show a badge for each airing's kinds, when every kind is shown together. */
  showKinds: boolean;
  end: Dayjs;
  entries: Map<string, CalendarEntryType[]>;
  onHideChannel?: HideChannelHandler;
  start: Dayjs;
};

const MONTH_CELL_ENTRIES = 4;

const isToday = (day: Dayjs, now: Dayjs) => day.isSame(now, 'day');

// The skeletons' rows, with their title widths varied so they look less uniform.
const skeletonRows = [0, 1, 2];
const skeletonTitleWidths = ['w-3/4', 'w-full', 'w-1/2', 'w-5/6', 'w-2/3'];

/** A week's day while it loads: three entries shaped like the `card` variant. */
const WeekDaySkeleton = ({ day }: { day: number }) => (
  <SkeletonFade className="flex flex-col gap-y-2" quiet>
    {skeletonRows.map(row => (
      <div key={row} className="flex gap-x-2 rounded-lg border border-panel-border bg-panel-background-alt p-2">
        <SkeletonBlock className="hidden h-20 w-14 shrink-0 rounded-lg 2xl:block" />
        <div className="flex min-w-0 grow flex-col gap-y-2 py-0.5">
          <SkeletonBlock className="h-3.5 w-10" />
          <SkeletonBlock className={cx('h-3.5', skeletonTitleWidths[(day + row) % skeletonTitleWidths.length])} />
          <SkeletonBlock className="h-3.5 w-1/2" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </SkeletonFade>
);

/** A month's day while it loads: three entries shaped like the `compact` variant. */
const MonthDaySkeleton = ({ day }: { day: number }) => (
  <SkeletonFade className="flex flex-col gap-y-1" quiet>
    {skeletonRows.map(row => (
      <div key={row} className="flex h-5 items-center gap-x-1.5">
        <SkeletonBlock className="h-3 w-8 shrink-0" />
        <SkeletonBlock className={cx('h-3', skeletonTitleWidths[(day + row) % skeletonTitleWidths.length])} />
      </div>
    ))}
  </SkeletonFade>
);

/** The agenda while it loads: a day's heading over three entries shaped like the `row` variant. */
export const AgendaViewSkeleton = () => (
  <SkeletonFade className="flex flex-col gap-y-2">
    <div className="flex h-[1.6rem] items-center">
      <SkeletonBlock className="h-4 w-44" />
    </div>
    <div className="flex flex-col">
      {skeletonRows.map(row => (
        <div key={row} className="flex items-center gap-x-4 rounded-lg p-3 even:bg-panel-background-alt">
          <div className="w-12 shrink-0">
            <SkeletonBlock className="h-4 w-10" />
          </div>
          <SkeletonBlock className="h-16 w-11 shrink-0 rounded-lg border border-panel-border" />
          <div className="flex min-w-0 grow basis-0 flex-col gap-y-2">
            <SkeletonBlock className={cx('h-4 max-w-80', skeletonTitleWidths[row])} />
            <SkeletonBlock className="h-3.5 w-24" />
          </div>
          <div className="flex w-64 shrink-0 flex-col items-end">
            <SkeletonBlock className="h-3.5 w-36" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonFade>
);

// The days are keyed by their place in the period, so the grid stays put and only their dates change with the period.
export const WeekView = ({ end, entries, loading, onHideChannel, showKinds, start }: Omit<ViewProps, 'date'>) => {
  const now = useNow();
  return (
    <div className="grid grow grid-cols-7 gap-x-3" aria-busy={loading}>
      {getPeriodDays(start, end).map((day, index) => {
        const dayEntries = entries.get(day.format(DAY_KEY_FORMAT)) ?? [];
        return (
          // oxlint-disable-next-line react/no-array-index-key -- a day's place in the period, kept across periods
          <div key={index} className="flex min-w-0 flex-col gap-y-2">
            <div
              className={cx(
                'flex flex-col items-center rounded-lg p-2 font-semibold',
                isToday(day, now)
                  ? 'bg-panel-menu-item-background text-panel-menu-item-text'
                  : 'bg-panel-background-alt',
              )}
            >
              <span>{day.format('dddd')}</span>
              <span className="text-sm opacity-65">{day.format('MMM D')}</span>
            </div>
            {loading
              ? <WeekDaySkeleton day={index} />
              : (
                <FadeIn className="flex flex-col gap-y-2">
                  {dayEntries.map(entry => (
                    <AiringEntry
                      key={entry.airing.ID}
                      entry={entry}
                      onHideChannel={onHideChannel}
                      showKinds={showKinds}
                      variant="card"
                    />
                  ))}
                </FadeIn>
              )}
          </div>
        );
      })}
    </div>
  );
};

export const MonthView = (
  { date, end, entries, loading, onHideChannel, onShowDay, showKinds, start }: ViewProps & {
    onShowDay: (day: Dayjs) => void;
  },
) => {
  const now = useNow();
  return (
    <div className="flex grow flex-col gap-y-2">
      <div className="grid grid-cols-7 gap-x-2 text-center font-semibold opacity-65">
        {getPeriodDays(start, start.add(1, 'week')).map(day => <span key={day.day()}>{day.format('ddd')}</span>)}
      </div>
      <div className="grid grow auto-rows-fr grid-cols-7 gap-2" aria-busy={loading}>
        {getPeriodDays(start, end).map((day, index) => {
          const dayEntries = entries.get(day.format(DAY_KEY_FORMAT)) ?? [];
          const hiddenCount = dayEntries.length - MONTH_CELL_ENTRIES;
          // The days of the months before and after are dimmed, their airings shown as they are.
          const isOtherMonth = !day.isSame(date, 'month');
          return (
            <div
              // oxlint-disable-next-line react/no-array-index-key -- a day's place in the period, kept across periods
              key={index}
              className={cx(
                'flex min-h-32 min-w-0 flex-col gap-y-1 rounded-lg border p-2',
                isToday(day, now) ? 'border-panel-text-primary' : 'border-panel-border',
                isOtherMonth ? 'bg-panel-background-alt/40' : 'bg-panel-background-alt',
              )}
            >
              <span
                className={cx(
                  'text-sm font-semibold',
                  isToday(day, now) && 'text-panel-text-primary',
                  isOtherMonth && 'opacity-50',
                )}
              >
                {day.format('D')}
              </span>
              {loading
                ? <MonthDaySkeleton day={index} />
                : (
                  <FadeIn className="flex flex-col gap-y-1">
                    {dayEntries.slice(0, MONTH_CELL_ENTRIES).map(entry => (
                      <AiringEntry
                        key={entry.airing.ID}
                        entry={entry}
                        onHideChannel={onHideChannel}
                        showKinds={showKinds}
                        variant="compact"
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <Button
                        className="self-start text-sm! text-panel-text-primary"
                        onClick={() => onShowDay(day)}
                      >
                        {`+${hiddenCount} more`}
                      </Button>
                    )}
                  </FadeIn>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// A day's heading, a line of the base text, and an entry, the poster with the row's padding, in rem.
const agendaHeadingHeight = 1.6;
const agendaEntryHeight = 5.5;
// The space below a day's heading, and between the days.
const agendaHeadingGap = 0.5;
const agendaDayGap = 1.5;

/** The space below a row: the heading's gap, the days' gap after a day's last row, none at the end. */
const getAgendaRowGapClassName = (row: AgendaRowType, isLast: boolean) => {
  if (row.type === 'day') return row.isDayEnd && !isLast ? 'pb-8' : 'pb-2';
  return row.isDayEnd && !isLast ? 'pb-6' : undefined;
};

// The rows are measured once drawn; this is a first guess, in px.
const estimateAgendaRowHeight = (row: AgendaRowType, isLast: boolean) => {
  const dayGap = row.isDayEnd && !isLast ? agendaDayGap : 0;
  if (row.type === 'day') return (agendaHeadingHeight + agendaHeadingGap + dayGap) * pxPerRem;
  return (agendaEntryHeight + dayGap) * pxPerRem;
};

/**
 * The days with airings, each heading its entries, as a virtual list on the main page's scroll container, so only the
 * rows in view are drawn.
 */
export const AgendaView = ({ end, entries, onHideChannel, showKinds, start }: Omit<ViewProps, 'date'>) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  // Kept as state, so the list is drawn again with its offset once it is in place.
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const now = useNow();

  const rows = getAgendaRows(start, end, entries);

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: index => rows[index].key,
    estimateSize: index => estimateAgendaRowHeight(rows[index], index === rows.length - 1),
    // Where the list starts in the scroll container, below the page's header and the toolbar.
    scrollMargin: getOffsetIn(listElement, scrollRef.current),
    overscan: 5,
  });
  const { scrollMargin } = rowVirtualizer.options;

  return (
    <div ref={setListElement} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            ref={rowVirtualizer.measureElement}
            data-index={virtualRow.index}
            className={cx(
              'absolute top-0 left-0 w-full',
              getAgendaRowGapClassName(row, virtualRow.index === rows.length - 1),
            )}
            style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
          >
            {row.type === 'day'
              ? (
                <div className={cx('font-semibold', isToday(row.day, now) && 'text-panel-text-primary')}>
                  {row.day.format('dddd, MMMM D')}
                  {isToday(row.day, now) && <span className="opacity-65">&nbsp;(Today)</span>}
                </div>
              )
              : (
                <AiringEntry
                  entry={row.entry}
                  onHideChannel={onHideChannel}
                  showKinds={showKinds}
                  striped={row.isStriped}
                  variant="row"
                />
              )}
          </div>
        );
      })}
    </div>
  );
};
