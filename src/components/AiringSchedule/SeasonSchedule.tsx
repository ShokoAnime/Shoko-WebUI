import { useHotkeys } from 'react-hotkeys-hook';
import { clamp, sumBy } from 'lodash';

import AiringToolbar from '@/components/AiringSchedule/AiringToolbar';
import SeasonView from '@/components/AiringSchedule/SeasonView';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import { useAiringSeasonSectionsQuery, useAiringSeasonsByYearQuery } from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import {
  getLastListedIndex,
  getSeasonIndex,
  isSameSeason,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';
import useAiringReadFilters from '@/hooks/useAiringReadFilters';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';
import useNow from '@/hooks/useNow';

import type { SeasonKey } from '@/core/types/api/airing-season';

/** The anime of a season by section, with the slider and the browser to pick the season. */
const SeasonSchedule = ({ onSettings }: { onSettings: () => void }) => {
  const { isBrowsing, scope, season: seasonParam, setParams, showReruns } = useAiringScheduleParams();
  const { episodeTypes, oldestSeasonYear, recentlyAired, sections: layout } = useSettingsQuery().data.WebUI_Settings
    .airingSchedule;
  const { args, filters, isReady } = useAiringReadFilters();
  const now = useNow();

  // The server says which season is under way, and lists up to the one after it.
  const seasonsQuery = useAiringSeasonsByYearQuery({ ...filters, fromYear: oldestSeasonYear ?? undefined }, layout);
  const browserQuery = useAiringSeasonsByYearQuery(
    { ...filters, fromYear: oldestSeasonYear ?? undefined, include: ['Images'] },
    layout,
    isBrowsing,
  );
  const seasons = seasonsQuery.data?.flatMap(item => item.seasons) ?? [];
  const currentSeason = seasons.find(item => item.isCurrent)?.key;
  const season = seasonParam ?? currentSeason;
  const isLastSeason = !season || getSeasonIndex(season) >= getLastListedIndex(seasonsQuery.data ?? []);

  // With the look back on, the season under way and the one before it are read as of that long ago, so a card keeps
  // an episode that aired since. The hour steps on, which reads the season again.
  const seasonsFromCurrent = season && currentSeason ? getSeasonIndex(season) - getSeasonIndex(currentSeason) : null;
  const asOf = recentlyAired.enabled && (seasonsFromCurrent === 0 || seasonsFromCurrent === -1)
    ? now.subtract(clamp(recentlyAired.hours, 1, 24), 'hour').startOf('hour').format()
    : undefined;
  // Left alone while the browser covers it, so it does not poll for what nothing shows.
  const sectionsQuery = useAiringSeasonSectionsQuery(
    season,
    {
      ...args,
      episodeKind: showReruns ? ['Normal', 'Advance', 'Rerun', 'DetectedRerun'] : ['Normal', 'Advance'],
      episodeType: episodeTypes ?? undefined,
    },
    layout,
    asOf,
    isReady && !isBrowsing,
  );
  const sections = sectionsQuery.data ?? [];

  const isRefreshing = isBrowsing ? browserQuery.isFetching : sectionsQuery.isFetching;

  const handleRefresh = () => {
    if (isRefreshing) return;
    if (isBrowsing) browserQuery.refetch().catch(console.error);
    else {
      seasonsQuery.refetch().catch(console.error);
      if (season) sectionsQuery.refetch().catch(console.error);
    }
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  // The season under way is left out of the URL.
  const toSeasonParam = (
    key: SeasonKey,
  ) => (currentSeason && isSameSeason(key, currentSeason) ? null : seasonKeyToValue(key));
  // Opening the season browser adds a history entry, so Back closes it; closing and picking replace it.
  const handleBrowseToggle = () => setParams({ browse: isBrowsing ? null : 'true' }, { replace: isBrowsing });
  const handleSeasonPick = (key: SeasonKey) =>
    setParams({ browse: null, season: toSeasonParam(key) }, { replace: true });

  return (
    <>
      <ShokoPanel
        title={season ? `Airing Schedule | ${seasonKeyToString(season)}` : 'Airing Schedule'}
        options={<ItemCount count={sumBy(sections, section => section.Anime.length)} suffix="Anime" />}
        fullHeight={false}
      >
        <AiringToolbar
          isRefreshing={isRefreshing}
          nextDisabledReason={isLastSeason ? 'Later seasons are not announced yet' : undefined}
          onRefresh={handleRefresh}
          onSettings={onSettings}
          onStep={offset => season && setParams({ season: toSeasonParam(shiftSeason(season, offset)) })}
        />
      </ShokoPanel>

      <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background p-6">
        <SeasonView
          browser={{ isError: browserQuery.isError, isPending: browserQuery.isPending, years: browserQuery.data ?? [] }}
          isBrowsing={isBrowsing}
          isError={seasonsQuery.isError || sectionsQuery.isError}
          isPending={seasonsQuery.isPending || (!!season && sectionsQuery.isPending)}
          now={now}
          onBrowseToggle={handleBrowseToggle}
          onRetry={handleRefresh}
          onSeasonChange={key => setParams({ season: toSeasonParam(key) })}
          onSeasonPick={handleSeasonPick}
          season={season}
          seasons={seasons}
          sections={sections}
          showCollectionBadge={scope === 'all'}
        />
      </div>
    </>
  );
};

export default SeasonSchedule;
