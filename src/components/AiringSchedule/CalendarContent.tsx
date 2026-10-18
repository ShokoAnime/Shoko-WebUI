import { Link } from 'react-router';

import AgendaView from '@/components/AiringSchedule/AgendaView';
import MonthView from '@/components/AiringSchedule/MonthView';
import PaneState, { PaneMessage } from '@/components/AiringSchedule/PaneState';
import WeekView from '@/components/AiringSchedule/WeekView';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';
import type { CalendarViewType } from '@/core/utilities/airingSchedule';

type Props = {
  date: Dayjs;
  end: Dayjs;
  entries: Map<string, CalendarEntryType[]>;
  hasEnabledProvider: boolean;
  isError: boolean;
  isPending: boolean;
  now: Dayjs;
  onRetry: () => void;
  onShowDay: (day: Dayjs) => void;
  start: Dayjs;
  view: CalendarViewType;
};

const CalendarContent = (
  { date, end, entries, hasEnabledProvider, isError, isPending, now, onRetry, onShowDay, start, view }: Props,
) => {
  if (isPending || isError) {
    return <PaneState errorText="Failed to load the airing schedule." isError={isError} onRetry={onRetry} />;
  }

  // An empty month or week still shows its grid; only the agenda, which lists days with airings, says so.
  if (view === 'agenda') {
    if (entries.size > 0) return <AgendaView start={start} end={end} entries={entries} now={now} />;
    if (hasEnabledProvider) {
      return (
        <PaneMessage title="Nothing airs in this period.">
          Try another period, or include more series with the filters above.
        </PaneMessage>
      );
    }
    return (
      <PaneMessage title="No airing schedule provider is enabled.">
        An admin can enable one in the&nbsp;
        <Link to="/webui/settings/airing-schedule" className="text-panel-text-primary">airing schedule settings</Link>.
      </PaneMessage>
    );
  }

  if (view === 'month') {
    return <MonthView date={date} start={start} end={end} entries={entries} now={now} onShowDay={onShowDay} />;
  }
  return <WeekView start={start} end={end} entries={entries} now={now} />;
};

export default CalendarContent;
