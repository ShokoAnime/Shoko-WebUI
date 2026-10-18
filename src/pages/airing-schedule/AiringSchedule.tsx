import { useHotkeys } from 'react-hotkeys-hook';
import { maxBy, sumBy } from 'lodash';

import AiringToolbar from '@/components/AiringSchedule/AiringToolbar';
import CalendarContent from '@/components/AiringSchedule/CalendarContent';
import SeasonView from '@/components/AiringSchedule/SeasonView';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import {
  useAiringCalendarQuery,
  useAiringProvidersQuery,
  useAiringSeasonSectionsQuery,
  useAiringSeasonsByYearQuery,
} from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import {
  AIRING_KINDS,
  DAY_KEY_FORMAT,
  getCalendarPeriod,
  getLocalTimeZone,
  getPeriodTitle,
  getPeriodUnit,
} from '@/core/utilities/airingSchedule';
import {
  getSeasonIndex,
  isSameSeason,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';
import useNow from '@/hooks/useNow';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

const noEntries = new Map<string, CalendarEntryType[]>();

const AiringSchedule = () => {
  const {
    date: dateParam,
    hideEstimates,
    kind,
    provider: providerId,
    scope,
    season: seasonParam,
    setParams,
    showReruns,
    view,
  } = useAiringScheduleParams();
  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;
  const now = useNow();
  const isSeasonView = view === 'season';
  // The date navigation works on the week while the season view is shown.
  const calendarView = isSeasonView ? 'week' : view;
  const date = dateParam ?? now.startOf('day');
  const { end, start } = getCalendarPeriod(calendarView, date);

  const providersQuery = useAiringProvidersQuery();
  const providers = providersQuery.data ?? [];
  const provider = providers.find(item => item.ID === providerId);
  // A provider named in the URL is looked up first, so an unknown one is never sent.
  const isReady = !providerId || providersQuery.isSuccess;

  const filters = {
    inCollection: scope === 'all' ? 'true' : 'only',
    includeRestricted: hideR18Content ? 'false' : 'true',
  } as const;
  // The server's default kind is the original broadcasts only, so "all" names them.
  const kinds = kind === 'All' ? AIRING_KINDS : [kind];

  const calendarQuery = useAiringCalendarQuery({
    ...filters,
    from: start.format(),
    to: end.format(),
    timeZone: getLocalTimeZone(),
    everyChannel: false,
    kind: kinds,
    provider: provider && [provider.ID],
    includeDateOnly: true,
    includeEstimates: !hideEstimates,
    episodeKind: showReruns ? undefined : ['Normal', 'Advance'],
    include: ['EpisodeTitle', 'Series', 'Poster'],
  }, !isSeasonView && isReady);
  const entries = calendarQuery.data ?? noEntries;
  const entryCount = sumBy([...entries.values()], day => day.length);

  // The server says which season is under way, and lists up to the one after it.
  const seasonsQuery = useAiringSeasonsByYearQuery(filters, null, isSeasonView);
  const seasons = seasonsQuery.data?.flatMap(item => item.seasons) ?? [];
  const currentSeason = seasons.find(item => item.isCurrent)?.key;
  const lastSeason = maxBy(seasons, item => getSeasonIndex(item.key))?.key;
  const season = seasonParam ?? currentSeason;
  const isLastSeason = !season || !lastSeason || getSeasonIndex(season) >= getSeasonIndex(lastSeason);

  const sectionsQuery = useAiringSeasonSectionsQuery(
    season,
    {
      ...filters,
      kind: kinds,
      provider: provider && [provider.ID],
      includeEstimates: !hideEstimates,
      episodeKind: showReruns ? ['Normal', 'Advance', 'Rerun', 'DetectedRerun'] : ['Normal', 'Advance'],
    },
    null,
    undefined,
    isSeasonView && isReady,
  );
  const sections = sectionsQuery.data ?? [];
  const animeCount = sumBy(sections, section => section.Anime.length);

  const handleRefresh = () => {
    if (isSeasonView) {
      if (seasonsQuery.isFetching || sectionsQuery.isFetching) return;
      seasonsQuery.refetch().catch(console.error);
      if (season) sectionsQuery.refetch().catch(console.error);
      return;
    }
    if (calendarQuery.isFetching) return;
    calendarQuery.refetch().catch(console.error);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const toDateParam = (day: Dayjs) => (day.isSame(now, 'day') ? null : day.format(DAY_KEY_FORMAT));
  const toSeasonParam = (
    key: SeasonKey,
  ) => (currentSeason && isSameSeason(key, currentSeason) ? null : seasonKeyToValue(key));
  const periodUnit = getPeriodUnit(calendarView);

  const handleStep = (offset: 1 | -1) => {
    if (!isSeasonView) setParams({ date: toDateParam(date.add(offset, periodUnit)) });
    else if (season) setParams({ season: toSeasonParam(shiftSeason(season, offset)) });
  };

  let title = 'Airing Schedule';
  if (!isSeasonView) title += ` | ${getPeriodTitle(calendarView, date, start, end)}`;
  else if (season) title += ` | ${seasonKeyToString(season)}`;

  return (
    <>
      <title>Airing Schedule | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <ShokoPanel
          title={title}
          options={isSeasonView
            ? <ItemCount count={animeCount} suffix="Anime" />
            : <ItemCount count={entryCount} suffix={entryCount === 1 ? 'Airing' : 'Airings'} />}
          fullHeight={false}
        >
          <AiringToolbar
            isRefreshing={isSeasonView ? sectionsQuery.isFetching : calendarQuery.isFetching}
            nextDisabledReason={isSeasonView && isLastSeason ? 'Later seasons are not announced yet' : undefined}
            onRefresh={handleRefresh}
            onStep={handleStep}
            onToday={() => setParams(isSeasonView ? { season: null } : { date: null })}
            providers={providers}
            unit={isSeasonView ? 'season' : periodUnit}
          />
        </ShokoPanel>

        <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background p-6">
          {isSeasonView
            ? (
              <SeasonView
                isError={seasonsQuery.isError || sectionsQuery.isError}
                isPending={seasonsQuery.isPending || (!!season && sectionsQuery.isPending)}
                now={now}
                onRetry={handleRefresh}
                sections={sections}
                showCollectionBadge={scope === 'all'}
              />
            )
            : (
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
                view={calendarView}
              />
            )}
        </div>
      </div>
    </>
  );
};

export default AiringSchedule;
