import cx from 'classnames';

import CompactEntry from '@/components/Calendar/Month/CompactEntry';
import Button from '@/components/Input/Button';
import { DAY_KEY_FORMAT, getPeriodDays } from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';

type Props = {
  /** A day of the shown month; the days of the months before and after it are dimmed. */
  date: Dayjs;
  end: Dayjs;
  entries: Map<string, CalendarEntryType[]>;
  now: Dayjs;
  onShowDay: (day: Dayjs) => void;
  start: Dayjs;
};

const MONTH_CELL_ENTRIES = 4;

const MonthView = ({ date, end, entries, now, onShowDay, start }: Props) => (
  <div className="flex grow flex-col gap-y-2">
    <div className="grid grid-cols-7 gap-x-2 text-center font-semibold opacity-65">
      {getPeriodDays(start, start.add(1, 'week')).map(day => <span key={day.day()}>{day.format('ddd')}</span>)}
    </div>
    <div className="grid grow auto-rows-fr grid-cols-7 gap-2">
      {getPeriodDays(start, end).map((day) => {
        const dayKey = day.format(DAY_KEY_FORMAT);
        const dayEntries = entries.get(dayKey) ?? [];
        const hiddenCount = dayEntries.length - MONTH_CELL_ENTRIES;
        const isToday = day.isSame(now, 'day');
        const isOtherMonth = !day.isSame(date, 'month');
        return (
          <div
            key={dayKey}
            className={cx(
              'flex min-h-32 min-w-0 flex-col gap-y-1 rounded-lg border p-2',
              isToday ? 'border-panel-text-primary' : 'border-panel-border',
              isOtherMonth ? 'bg-panel-background-alt/40' : 'bg-panel-background-alt',
            )}
          >
            <span
              className={cx(
                'text-sm font-semibold',
                isToday && 'text-panel-text-primary',
                isOtherMonth && 'opacity-50',
              )}
            >
              {day.format('D')}
            </span>
            {dayEntries.slice(0, MONTH_CELL_ENTRIES).map(entry => (
              <CompactEntry key={entry.airing.ID} entry={entry} now={now} />
            ))}
            {hiddenCount > 0 && (
              <Button
                className="self-start text-sm! text-panel-text-primary"
                onClick={() => onShowDay(day)}
              >
                {`+${hiddenCount} more`}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default MonthView;
