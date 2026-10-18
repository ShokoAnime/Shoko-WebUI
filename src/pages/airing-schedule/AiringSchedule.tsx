import { useHotkeys } from 'react-hotkeys-hook';
import { clamp, maxBy, sumBy } from 'lodash';
import { useToggle } from 'usehooks-ts';

import AiringScheduleSettingsModal from '@/components/AiringSchedule/AiringScheduleSettingsModal';
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
    isBrowsing,
    kind,
    provider: providerId,
    scope,
    season: seasonParam,
    setParams,
    showReruns,
    view,
  } = useAiringScheduleParams();
  const webuiSettings = useSettingsQuery().data.WebUI_Settings;
  const { hideR18Content } = webuiSettings.dashboard;
  const { episodeTypes, oldestSeasonYear, recentlyAired, sections: layout } = webuiSettings.airingSchedule;
  const [showSettings, toggleSettings] = useToggle(false);
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
    type: episodeTypes ?? undefined,
    include: ['EpisodeTitle', 'Series', 'Poster'],
  }, !isSeasonView && isReady);
  const entries = calendarQuery.data ?? noEntries;
  const entryCount = sumBy([...entries.values()], day => day.length);

  // The server says which season is under way, and lists up to the one after it.
  const seasonsQuery = useAiringSeasonsByYearQuery(
    { ...filters, fromYear: oldestSeasonYear ?? undefined },
    layout,
    isSeasonView,
  );
  const seasons = seasonsQuery.data?.flatMap(item => item.seasons) ?? [];
  const currentSeason = seasons.find(item => item.isCurrent)?.key;
  const lastSeason = maxBy(seasons, item => getSeasonIndex(item.key))?.key;
  const browserQuery = useAiringSeasonsByYearQuery(
    { ...filters, fromYear: oldestSeasonYear ?? undefined, include: ['Images'] },
    layout,
    isSeasonView && isBrowsing,
  );
  const season = seasonParam ?? currentSeason;
  const isLastSeason = !season || !lastSeason || getSeasonIndex(season) >= getSeasonIndex(lastSeason);

  // With the look back on, the season under way and the one before it are read as of that long ago, so a card keeps
  // an episode that aired since. The hour steps on, which reads the season again.
  const seasonsFromCurrent = season && currentSeason ? getSeasonIndex(season) - getSeasonIndex(currentSeason) : null;
  const asOf = recentlyAired.enabled && (seasonsFromCurrent === 0 || seasonsFromCurrent === -1)
    ? now.subtract(clamp(recentlyAired.hours, 1, 24), 'hour').startOf('hour').format()
    : undefined;
  const sectionsQuery = useAiringSeasonSectionsQuery(
    season,
    {
      ...filters,
      kind: kinds,
      provider: provider && [provider.ID],
      includeEstimates: !hideEstimates,
      episodeKind: showReruns ? ['Normal', 'Advance', 'Rerun', 'DetectedRerun'] : ['Normal', 'Advance'],
      episodeType: episodeTypes ?? undefined,
    },
    layout,
    asOf,
    isSeasonView && isReady,
  );
  const sections = sectionsQuery.data ?? [];
  const animeCount = sumBy(sections, section => section.Anime.length);

  let isRefreshing = calendarQuery.isFetching;
  if (isSeasonView) isRefreshing = isBrowsing ? browserQuery.isFetching : sectionsQuery.isFetching;

  const handleRefresh = () => {
    if (isRefreshing) return;
    if (!isSeasonView) calendarQuery.refetch().catch(console.error);
    else if (isBrowsing) browserQuery.refetch().catch(console.error);
    else {
      seasonsQuery.refetch().catch(console.error);
      if (season) sectionsQuery.refetch().catch(console.error);
    }
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const toDateParam = (day: Dayjs) => (day.isSame(now, 'day') ? null : day.format(DAY_KEY_FORMAT));
  const toSeasonParam = (
    key: SeasonKey,
  ) => (currentSeason && isSameSeason(key, currentSeason) ? null : seasonKeyToValue(key));
  const periodUnit = getPeriodUnit(calendarView);

  // Opening the season browser adds a history entry, so Back closes it; closing and picking replace it.
  const handleBrowseToggle = () => setParams({ browse: isBrowsing ? null : 'true' }, { replace: isBrowsing });
  const handleSeasonChange = (key: SeasonKey) => setParams({ season: toSeasonParam(key) });
  const handleSeasonPick = (key: SeasonKey) =>
    setParams({ browse: null, season: toSeasonParam(key) }, { replace: true });

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
            isRefreshing={isRefreshing}
            nextDisabledReason={isSeasonView && isLastSeason ? 'Later seasons are not announced yet' : undefined}
            onRefresh={handleRefresh}
            onSettings={toggleSettings}
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
                browser={{
                  isError: browserQuery.isError,
                  isPending: browserQuery.isPending,
                  years: browserQuery.data ?? [],
                }}
                isBrowsing={isBrowsing}
                isError={seasonsQuery.isError || sectionsQuery.isError}
                isPending={seasonsQuery.isPending || (!!season && sectionsQuery.isPending)}
                now={now}
                onBrowseToggle={handleBrowseToggle}
                onRetry={handleRefresh}
                onSeasonChange={handleSeasonChange}
                onSeasonPick={handleSeasonPick}
                season={season}
                seasons={seasons}
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

      <AiringScheduleSettingsModal show={showSettings} onClose={toggleSettings} />
    </>
  );
};

export default AiringSchedule;
