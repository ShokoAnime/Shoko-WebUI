import cx from 'classnames';

import CardEntry from '@/components/Calendar/Week/CardEntry';
import { DAY_KEY_FORMAT, getPeriodDays } from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';

type Props = {
  end: Dayjs;
  entries: Map<string, CalendarEntryType[]>;
  now: Dayjs;
  start: Dayjs;
};

const WeekView = ({ end, entries, now, start }: Props) => (
  <div className="grid grow grid-cols-7 gap-x-3">
    {getPeriodDays(start, end).map((day) => {
      const dayKey = day.format(DAY_KEY_FORMAT);
      return (
        <div key={dayKey} className="flex min-w-0 flex-col gap-y-2">
          <div
            className={cx(
              'flex flex-col items-center rounded-lg p-2 font-semibold',
              day.isSame(now, 'day')
                ? 'bg-panel-menu-item-background text-panel-menu-item-text'
                : 'bg-panel-background-alt',
            )}
          >
            <span>{day.format('dddd')}</span>
            <span className="text-sm opacity-65">{day.format('MMM D')}</span>
          </div>
          {(entries.get(dayKey) ?? []).map(entry => <CardEntry key={entry.airing.ID} entry={entry} now={now} />)}
        </div>
      );
    })}
  </div>
);

export default WeekView;
