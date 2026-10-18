import cx from 'classnames';

import { RowEntry } from '@/components/AiringSchedule/AiringEntries';
import VirtualRows from '@/components/AiringSchedule/VirtualRows';
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
  const rows = getAgendaRows(start, end, entries);

  return (
    <VirtualRows
      count={rows.length}
      getKey={index => rows[index].key}
      estimateSize={index => getRowHeight(rows[index]) * pxPerRem}
      overscan={10}
      renderRow={(index) => {
        const row = rows[index];
        if (row.type === 'entry') return <RowEntry entry={row.entry} isStriped={row.isStriped} now={now} />;
        return (
          <div className={cx('font-semibold', row.day.isSame(now, 'day') && 'text-panel-text-primary')}>
            {row.day.format('dddd, MMMM D')}
            {row.day.isSame(now, 'day') && <span className="opacity-65">&nbsp;(Today)</span>}
          </div>
        );
      }}
    />
  );
};

export default AgendaView;
