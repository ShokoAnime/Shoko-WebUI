import { useHotkeys } from 'react-hotkeys-hook';
import { sumBy } from 'lodash';

import AiringToolbar from '@/components/AiringSchedule/AiringToolbar';
import CalendarContent from '@/components/AiringSchedule/CalendarContent';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import { useAiringCalendarQuery, useAiringProvidersQuery } from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import {
  DAY_KEY_FORMAT,
  getCalendarPeriod,
  getLocalTimeZone,
  getPeriodTitle,
  getPeriodUnit,
} from '@/core/utilities/airingSchedule';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';
import useNow from '@/hooks/useNow';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';

const noEntries = new Map<string, CalendarEntryType[]>();

const AiringSchedule = () => {
  const { date: dateParam, hideEstimates, kind, provider: providerId, scope, setParams, showReruns, view } =
    useAiringScheduleParams();
  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;
  const now = useNow();
  const date = dateParam ?? now.startOf('day');
  const { end, start } = getCalendarPeriod(view, date);

  const providersQuery = useAiringProvidersQuery();
  const providers = providersQuery.data ?? [];
  const provider = providers.find(item => item.ID === providerId);

  // The server's default kind is the original broadcasts only, so "all" names them.
  const calendarQuery = useAiringCalendarQuery({
    from: start.format(),
    to: end.format(),
    timeZone: getLocalTimeZone(),
    everyChannel: false,
    kind: kind === 'All' ? ['Original', 'Subtitled', 'Dubbed'] : [kind],
    provider: provider && [provider.ID],
    inCollection: scope === 'all' ? 'true' : 'only',
    includeDateOnly: true,
    includeEstimates: !hideEstimates,
    includeRestricted: hideR18Content ? 'false' : 'true',
    episodeKind: showReruns ? undefined : ['Normal', 'Advance'],
    include: ['EpisodeTitle', 'Series', 'Poster'],
  }, !providerId || providersQuery.isSuccess);
  const entries = calendarQuery.data ?? noEntries;
  const entryCount = sumBy([...entries.values()], day => day.length);

  const handleRefresh = () => {
    if (calendarQuery.isFetching) return;
    calendarQuery.refetch().catch(console.error);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const toDateParam = (day: Dayjs) => (day.isSame(now, 'day') ? null : day.format(DAY_KEY_FORMAT));
  const unit = getPeriodUnit(view);

  return (
    <>
      <title>Airing Schedule | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <ShokoPanel
          title={`Airing Schedule | ${getPeriodTitle(view, date, start, end)}`}
          options={<ItemCount count={entryCount} suffix={entryCount === 1 ? 'Airing' : 'Airings'} />}
          fullHeight={false}
        >
          <AiringToolbar
            isRefreshing={calendarQuery.isFetching}
            onRefresh={handleRefresh}
            onStep={offset => setParams({ date: toDateParam(date.add(offset, unit)) })}
            onToday={() => setParams({ date: null })}
            providers={providers}
            unit={unit}
          />
        </ShokoPanel>

        <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background p-6">
          <CalendarContent
            date={date}
            end={end}
            entries={entries}
            hasEnabledProvider={providersQuery.data?.some(item => item.IsEnabled) ?? true}
            isError={calendarQuery.isError}
            isPending={calendarQuery.isPending}
            now={now}
            onRetry={handleRefresh}
            onShowDay={day => setParams({ view: 'week', date: toDateParam(day) })}
            start={start}
            view={view}
          />
        </div>
      </div>
    </>
  );
};

export default AiringSchedule;
