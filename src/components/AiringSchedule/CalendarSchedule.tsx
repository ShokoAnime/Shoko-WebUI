import { useHotkeys } from 'react-hotkeys-hook';
import { sumBy } from 'lodash';

import AiringToolbar from '@/components/AiringSchedule/AiringToolbar';
import CalendarContent from '@/components/AiringSchedule/CalendarContent';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import { useAiringCalendarQuery } from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import {
  DAY_KEY_FORMAT,
  getCalendarPeriod,
  getLocalTimeZone,
  getPeriodTitle,
  getPeriodUnit,
} from '@/core/utilities/airingSchedule';
import useAiringReadFilters from '@/hooks/useAiringReadFilters';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';
import useNow from '@/hooks/useNow';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';
import type { CalendarViewType } from '@/core/utilities/airingSchedule';

const noEntries = new Map<string, CalendarEntryType[]>();

type Props = {
  onSettings: () => void;
  view: CalendarViewType;
};

/** The month, week or agenda: the airings of a period, by day. */
const CalendarSchedule = ({ onSettings, view }: Props) => {
  const { date: dateParam, setParams, showReruns } = useAiringScheduleParams();
  const { episodeTypes } = useSettingsQuery().data.WebUI_Settings.airingSchedule;
  const { args, hasEnabledProvider, isReady } = useAiringReadFilters();
  const now = useNow();
  const date = dateParam ?? now.startOf('day');
  const { end, start } = getCalendarPeriod(view, date);

  const query = useAiringCalendarQuery({
    ...args,
    from: start.format(),
    to: end.format(),
    timeZone: getLocalTimeZone(),
    everyChannel: false,
    includeDateOnly: true,
    episodeKind: showReruns ? undefined : ['Normal', 'Advance'],
    type: episodeTypes ?? undefined,
    include: ['EpisodeTitle', 'Series', 'Poster'],
  }, isReady);
  const entries = query.data ?? noEntries;
  const entryCount = sumBy([...entries.values()], day => day.length);

  const handleRefresh = () => {
    if (query.isFetching) return;
    query.refetch().catch(console.error);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  // Today is left out of the URL.
  const toDateParam = (day: Dayjs) => (day.isSame(now, 'day') ? null : day.format(DAY_KEY_FORMAT));

  return (
    <>
      <ShokoPanel
        title={`Airing Schedule | ${getPeriodTitle(view, date, start, end)}`}
        options={<ItemCount count={entryCount} suffix={entryCount === 1 ? 'Airing' : 'Airings'} />}
        fullHeight={false}
      >
        <AiringToolbar
          isRefreshing={query.isFetching}
          onRefresh={handleRefresh}
          onSettings={onSettings}
          onStep={offset => setParams({ date: toDateParam(date.add(offset, getPeriodUnit(view))) })}
        />
      </ShokoPanel>

      <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background p-6">
        <CalendarContent
          date={date}
          end={end}
          entries={entries}
          hasEnabledProvider={hasEnabledProvider}
          isError={query.isError}
          isPending={query.isPending}
          now={now}
          onRetry={handleRefresh}
          onShowDay={day => setParams({ view: 'week', date: toDateParam(day) })}
          start={start}
          view={view}
        />
      </div>
    </>
  );
};

export default CalendarSchedule;
