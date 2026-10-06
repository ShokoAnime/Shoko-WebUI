import { useEffect } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Link, useLocation, useSearchParams } from 'react-router';
import type { NavigateOptions } from 'react-router';
import { mdiCalendarToday, mdiChevronLeft, mdiChevronRight, mdiCog, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import MultiStateButton from '@/components/Input/MultiStateButton';
import SelectSmall from '@/components/Input/SelectSmall';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import AiringScheduleSettingsModal from '@/components/Utilities/AiringSchedule/AiringScheduleSettingsModal';
import {
  AgendaView,
  AgendaViewSkeleton,
  MonthView,
  WeekView,
} from '@/components/Utilities/AiringSchedule/CalendarViews';
import { SeasonBrowserSkeleton } from '@/components/Utilities/AiringSchedule/SeasonBrowser';
import SeasonView, { SeasonViewSkeleton } from '@/components/Utilities/AiringSchedule/SeasonView';
import { FadeIn } from '@/components/Utilities/AiringSchedule/Skeleton';
import SlidingText from '@/components/Utilities/AiringSchedule/SlidingText';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { airingSeasonImagesInclude } from '@/core/react-query/airing-schedule/helpers';
import {
  useAiringCalendarQuery,
  useAiringProvidersByIdQuery,
  useAiringProvidersQuery,
  useAiringSeasonSectionsQuery,
  useAiringSeasonsByYearQuery,
} from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setEveryChannel, setLastView } from '@/core/slices/utilities/airingSchedule';
import { useDispatch, useSelector } from '@/core/store';
import { dayjs } from '@/core/util';
import {
  DAY_KEY_FORMAT,
  clampRecentlyAiredHours,
  getCalendarPeriod,
  getLocalTimeZone,
  getPeriodUnit,
  getRecentlyAiredAt,
  toAiringRequestDates,
} from '@/core/utilities/airingSchedule';
import { formatClockOffset } from '@/core/utilities/clock';
import {
  getCurrentSeason,
  getSeasonIndex,
  parseSeasonKey,
  seasonKeyToString,
  seasonKeyToValue,
  shiftSeason,
} from '@/core/utilities/season';
import { getSeasonBrowserCloseAction, getSeasonStrip, seasonBrowserEntryState } from '@/core/utilities/seasonSlider';
import useAiringChannelFilter from '@/hooks/useAiringChannelFilter';
import { AiringProvidersContext } from '@/hooks/useAiringProviderContext';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useNow, { useClockOffset } from '@/hooks/useNow';

import type { AiringKindType, EpisodeAiringKindType } from '@/core/types/api/airing-schedule';
import type { CalendarEntryType, CalendarViewType } from '@/core/utilities/airingSchedule';
import type { SeasonKey } from '@/core/utilities/season';
import type { Dayjs } from 'dayjs';

type ViewType = CalendarViewType | 'season';

const viewStates: { label: string, value: ViewType }[] = [
  { label: 'Season', value: 'season' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Agenda', value: 'agenda' },
];

type KindFilterType = AiringKindType | 'All';

const allKinds: AiringKindType[] = ['Original', 'Subtitled', 'Dubbed'];

const noRerunKinds: EpisodeAiringKindType[] = ['Normal', 'Advance'];

const allEpisodeKinds: EpisodeAiringKindType[] = ['Normal', 'Advance', 'Rerun', 'DetectedRerun'];

const kindOptions: { label: string, value: KindFilterType }[] = [
  { label: 'All Kinds', value: 'All' },
  { label: 'Original', value: 'Original' },
  { label: 'Subtitled', value: 'Subtitled' },
  { label: 'Dubbed', value: 'Dubbed' },
];

// The view switcher and the navigation sit beside the toolbar, each in a box of its own.
const toolbarGroupClassName =
  'flex flex-wrap items-center gap-2 rounded-lg border border-panel-border bg-panel-background-alt px-2 py-2';

const parseView = (value: string | null): ViewType => {
  if (value === 'month' || value === 'agenda' || value === 'week') return value;
  return 'season';
};

const parseKind = (value: string | null): KindFilterType => {
  if (value === 'Original' || value === 'Subtitled' || value === 'Dubbed') return value;
  return 'All';
};

const getPeriodTitle = (view: CalendarViewType, date: Dayjs, start: Dayjs, end: Dayjs) => {
  if (view !== 'week') return date.format('MMMM YYYY');
  const last = end.subtract(1, 'day');
  if (start.isSame(last, 'month')) return `${start.format('MMMM D')} - ${last.format('D, YYYY')}`;
  if (start.isSame(last, 'year')) return `${start.format('MMMM D')} - ${last.format('MMMM D, YYYY')}`;
  return `${start.format('MMMM D, YYYY')} - ${last.format('MMMM D, YYYY')}`;
};

const AiringSchedule = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigateVoid();
  const settings = useSettingsQuery().data;
  const { hideR18Content } = settings.WebUI_Settings.dashboard;
  // The season view's oldest year, recently aired look back and layout, and the episode types, are set in the page's
  // settings modal.
  const { episodeTypes, oldestSeasonYear, recentlyAired, sections } = settings.WebUI_Settings.airingSchedule;
  const episodeTypeParam = episodeTypes?.join(',');

  // Without a view in the URL, the page opens on the last one used.
  const lastView = useSelector(state => state.utilities.airingSchedule.lastView);
  const urlView = searchParams.get('view');
  const view = parseView(urlView ?? lastView);
  const isSeasonView = view === 'season';
  const isAiringView = !isSeasonView;
  // The day-based view the date navigation works with; a week behind the season view.
  const calendarView = view === 'season' ? 'week' : view;
  // Today and the current season follow the schedule's clock, which a debug build may shift.
  const now = useNow();
  const clockOffset = useClockOffset();
  const currentSeason = getCurrentSeason(now.toDate());
  const season = parseSeasonKey(searchParams.get('season') ?? '') ?? currentSeason;
  const isBrowsing = isSeasonView && searchParams.get('browse') === 'true';
  const dateParam = searchParams.get('date');
  const date = dateParam && dayjs(dateParam, DAY_KEY_FORMAT, true).isValid()
    ? dayjs(dateParam, DAY_KEY_FORMAT)
    : now.startOf('day');
  const showAll = searchParams.get('scope') === 'all';
  const hideEstimates = searchParams.get('hideEstimates') === 'true';
  const showReruns = searchParams.get('showReruns') === 'true';
  const kind = parseKind(searchParams.get('kind'));
  // A kind badge only tells the airings apart when every kind is shown together.
  const showKinds = kind === 'All';
  const providerId = searchParams.get('provider') ?? '';
  const [showSettings, toggleSettings] = useToggle(false);
  // Every airing of an episode or just its lead, shared by every view and kept for the session.
  const everyChannel = useSelector(state => state.utilities.airingSchedule.everyChannel);
  const dispatch = useDispatch();
  // A view named in the URL becomes the remembered one.
  useEffect(() => {
    if (urlView) dispatch(setLastView(urlView));
  }, [dispatch, urlView]);

  const setParams = (changes: Record<string, string | null>, options?: NavigateOptions) => {
    setSearchParams((currentParams) => {
      const newParams = new URLSearchParams(currentParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) newParams.delete(key);
        else newParams.set(key, value);
      }
      return newParams;
    }, options);
  };

  const { end, start } = getCalendarPeriod(calendarView, date);
  const providersQuery = useAiringProvidersQuery();
  // Read once here for every entry and card, which look up their provider's icon.
  const providersById = useAiringProvidersByIdQuery().data;
  // The channels filter is shared by every view and kept for the session.
  const channelFilter = useAiringChannelFilter();
  const airingParams = {
    kind: kind === 'All' ? allKinds : [kind],
    provider: providerId ? [providerId] : undefined,
    includeRestricted: hideR18Content ? 'false' : 'true',
    includeEstimates: !hideEstimates,
    // Reruns are left out unless asked for.
    episodeKind: showReruns ? undefined : noRerunKinds,
  } as const;
  // The server groups the airings by local day and episode, leading with its preferred airing of each.
  const calendarQuery = useAiringCalendarQuery({
    ...toAiringRequestDates(start, end),
    timeZone: getLocalTimeZone(),
    everyChannel,
    ...airingParams,
    inCollection: showAll ? 'true' : 'only',
    includeDateOnly: true,
    type: episodeTypeParam,
    channel: channelFilter.channel,
    include: ['EpisodeTitle', 'Series', 'Poster'],
  }, isAiringView && channelFilter.enabled);

  // The season view and its browser read the anime with the same filters, so the counts agree.
  const seasonFilters = {
    inCollection: showAll ? 'true' : 'only',
    includeRestricted: airingParams.includeRestricted,
    channel: channelFilter.channel,
  } as const;
  // The season view's slider lists the browser's seasons, without their images. The server lists them up to one past
  // the current one; what lies beyond is still to be announced.
  const seasonListQuery = useAiringSeasonsByYearQuery(
    {
      ...seasonFilters,
      fromYear: oldestSeasonYear ?? undefined,
    },
    isSeasonView && channelFilter.enabled,
    clockOffset,
  );
  const seasonStrip = getSeasonStrip(seasonListQuery.data ?? [], currentSeason);
  const lastSeason = seasonStrip.at(-1);
  const isLastSeason = lastSeason !== undefined && getSeasonIndex(season) >= getSeasonIndex(lastSeason.key);
  const browserQuery = useAiringSeasonsByYearQuery(
    {
      ...seasonFilters,
      include: airingSeasonImagesInclude,
      fromYear: oldestSeasonYear ?? undefined,
    },
    isBrowsing && channelFilter.enabled,
    clockOffset,
  );
  // With the look back on, the season under way and the one before it read as of that long ago, so a card keeps an
  // episode that aired since. The time steps on every 15 minutes, which reads the season again and moves the cards on.
  const seasonsFromCurrent = getSeasonIndex(season) - getSeasonIndex(currentSeason);
  const recentlyAiredAt = recentlyAired.enabled && (seasonsFromCurrent === 0 || seasonsFromCurrent === -1)
    ? getRecentlyAiredAt(now, clampRecentlyAiredHours(recentlyAired.hours)).format()
    : null;
  // The season's anime with their next new episode, resolved, grouped and sorted by the server under the same filters.
  const seasonQuery = useAiringSeasonSectionsQuery(
    season,
    {
      ...airingParams,
      ...seasonFilters,
      // The season route leaves reruns out unless asked for every kind.
      episodeKind: showReruns ? allEpisodeKinds : noRerunKinds,
      episodeType: episodeTypeParam,
    },
    sections,
    isSeasonView && channelFilter.enabled,
    clockOffset,
    recentlyAiredAt,
  );
  const seasonSections = seasonQuery.data ?? [];
  const seasonAnime = seasonSections.flatMap(section => section.Anime);
  const entries = calendarQuery.data ?? new Map<string, CalendarEntryType[]>();
  // The season view counts the channels of its next airings.
  const filterChannels = channelFilter.getItems(
    isSeasonView
      ? seasonAnime.flatMap(item => (item.NextAiring ? [item.NextAiring, ...item.OtherAirings] : []))
      : [...entries.values()].flat().flatMap(entry => [entry.airing, ...entry.others.map(other => other.airing)]),
  );
  const entryCount = [...entries.values()].reduce((count, day) => count + day.length, 0);
  const hasEnabledProvider = providersQuery.data?.some(provider => provider.IsEnabled) ?? true;

  let isRefreshing = calendarQuery.isFetching;
  if (isSeasonView) isRefreshing = seasonQuery.isFetching;
  if (isBrowsing) isRefreshing = browserQuery.isFetching;
  const handleRefresh = () => {
    if (isRefreshing) return;
    if (isBrowsing) {
      browserQuery.refetch().catch(console.error);
      return;
    }
    if (isSeasonView) {
      seasonQuery.refetch().catch(console.error);
      return;
    }
    calendarQuery.refetch().catch(console.error);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  const handleDateChange = (newDate: Dayjs | null) =>
    setParams({ date: newDate && !newDate.isSame(now, 'day') ? newDate.format(DAY_KEY_FORMAT) : null });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) =>
    setParams({ [event.target.id]: event.target.checked ? 'true' : null });

  const unit = isSeasonView ? 'season' : getPeriodUnit(calendarView);

  // The current season is left out of the URL.
  const toSeasonParam = (newSeason: SeasonKey | null) => {
    if (!newSeason || seasonKeyToValue(newSeason) === seasonKeyToValue(currentSeason)) return null;
    return seasonKeyToValue(newSeason);
  };

  const handleSeasonChange = (newSeason: SeasonKey | null) => setParams({ season: toSeasonParam(newSeason) });

  // Opening the browser pushes an entry, so Back closes it. Closing steps back over that entry when it is the current
  // one, and a pick replaces it, so Back then returns to the page before the browser opened.
  const openBrowser = () => setParams({ browse: 'true' }, { state: seasonBrowserEntryState });
  const closeBrowser = () => {
    if (getSeasonBrowserCloseAction(location.state) === 'back') navigate(-1);
    else setParams({ browse: null }, { replace: true });
  };
  const handleSeasonPick = (newSeason: SeasonKey) =>
    setParams({ browse: null, season: toSeasonParam(newSeason) }, { replace: true });

  const handleStep = (offset: number) => {
    if (isSeasonView) handleSeasonChange(shiftSeason(season, offset));
    else {handleDateChange(
        offset > 0 ? date.add(1, getPeriodUnit(calendarView)) : date.subtract(1, getPeriodUnit(calendarView)),
      );}
  };

  const renderCount = () => {
    if (isBrowsing) {
      const seasonCount = (browserQuery.data ?? []).flatMap(item => item.seasons).filter(item => item.count > 0).length;
      return <ItemCount count={seasonCount} suffix={seasonCount === 1 ? 'Season' : 'Seasons'} />;
    }
    if (isSeasonView) return <ItemCount count={seasonAnime.length} suffix="Anime" />;
    return <ItemCount count={entryCount} suffix={entryCount === 1 ? 'Airing' : 'Airings'} />;
  };

  // Debug builds only: the clock the schedule runs on, while the URL shifts it.
  const renderClock = () => {
    if (clockOffset === null) return null;
    const time = now.format(now.isSame(dayjs(), 'day') ? 'HH:mm' : 'ddd, MMM D, HH:mm');
    return (
      <span
        className="rounded-sm border border-panel-text-warning px-1.5 text-xs text-panel-text-warning"
        data-tooltip-id="tooltip"
        data-tooltip-content="Set by the clockOffset URL parameter, in debug builds only"
      >
        {`Clock: ${time} (shifted ${formatClockOffset(clockOffset)})`}
      </span>
    );
  };

  const periodTitle = isSeasonView ? seasonKeyToString(season) : getPeriodTitle(calendarView, date, start, end);

  const renderTitle = () => (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span>Airing Schedule</span>
      <span>|</span>
      <SlidingText
        text={periodTitle}
        order={isSeasonView ? getSeasonIndex(season) : start.valueOf()}
        resetKey={view}
      />
    </div>
  );

  // The season view keeps its slider in view while the season's anime load, and the month and week views their grid,
  // so they show their own skeletons.
  const isPanelPending = view === 'agenda' && calendarQuery.isPending;

  const renderContent = () => {
    if (isSeasonView) {
      let fallback: ReactNode = null;
      if (seasonQuery.isPending) fallback = <SeasonViewSkeleton />;
      if (seasonQuery.isError) {
        fallback = (
          <div className="flex grow flex-col items-center justify-center gap-y-4 font-semibold">
            <span className="text-panel-text-danger">Failed to load the anime of the season.</span>
            <Button buttonType="secondary" buttonSize="normal" onClick={handleRefresh}>Try Again</Button>
          </div>
        );
      }
      let browserFallback: ReactNode = null;
      if (browserQuery.isPending) browserFallback = <SeasonBrowserSkeleton />;
      if (browserQuery.isError) {
        browserFallback = (
          <div className="flex grow flex-col items-center justify-center gap-y-4 font-semibold">
            <span className="text-panel-text-danger">Failed to load the seasons.</span>
            <Button buttonType="secondary" buttonSize="normal" onClick={handleRefresh}>Try Again</Button>
          </div>
        );
      }
      return (
        <SeasonView
          season={season}
          strip={seasonStrip}
          fallback={fallback}
          sections={seasonSections}
          showCollectionBadge={showAll}
          onSeasonChange={handleSeasonChange}
          isBrowsing={isBrowsing}
          onBrowseToggle={isBrowsing ? closeBrowser : openBrowser}
          years={browserQuery.data ?? []}
          browserFallback={browserFallback}
          onSeasonPick={handleSeasonPick}
        />
      );
    }

    if (calendarQuery.isError) {
      return (
        <div className="flex grow flex-col items-center justify-center gap-y-4 font-semibold">
          <span className="text-panel-text-danger">Failed to load the airing schedule.</span>
          <Button buttonType="secondary" buttonSize="normal" onClick={handleRefresh}>Try Again</Button>
        </div>
      );
    }

    // An empty month or week still shows its grid; only the agenda, which lists days with airings, says so.
    if (entryCount === 0 && view === 'agenda') {
      return (
        <div className="flex grow flex-col items-center justify-center gap-y-2 text-center font-semibold">
          {hasEnabledProvider
            ? (
              <>
                <span>Nothing airs in this period.</span>
                <span className="opacity-65">Try another period, or include more series with the filters above.</span>
              </>
            )
            : (
              <>
                <span>No airing schedule provider is enabled.</span>
                <span className="opacity-65">
                  An admin can enable one in the&nbsp;
                  <Link to="/webui/settings/airing-schedule" className="text-panel-text-primary">
                    airing schedule settings
                  </Link>
                  .
                </span>
              </>
            )}
        </div>
      );
    }

    if (view === 'month') {
      return (
        <MonthView
          date={date}
          end={end}
          entries={entries}
          loading={calendarQuery.isPending}
          onHideChannel={channelFilter.hideChannel}
          onShowDay={day => setParams({ view: 'week', date: day.format(DAY_KEY_FORMAT) })}
          showKinds={showKinds}
          start={start}
        />
      );
    }

    if (view === 'agenda') {
      return (
        <AgendaView
          end={end}
          entries={entries}
          onHideChannel={channelFilter.hideChannel}
          showKinds={showKinds}
          start={start}
        />
      );
    }

    return (
      <WeekView
        end={end}
        entries={entries}
        loading={calendarQuery.isPending}
        onHideChannel={channelFilter.hideChannel}
        showKinds={showKinds}
        start={start}
      />
    );
  };

  return (
    <AiringProvidersContext.Provider value={providersById}>
      <title>Airing Schedule | Shoko</title>
      {/* Not a scroll container, so the season view's slider sticks to the main page's. */}
      <div className="flex grow flex-col gap-y-6">
        <ShokoPanel
          title={renderTitle()}
          options={
            <div className="flex items-center gap-x-3">
              {renderClock()}
              {renderCount()}
            </div>
          }
          fullHeight={false}
        >
          <div className="flex flex-wrap gap-3">
            <div className="flex grow flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-2">
              <MenuButton
                onClick={handleRefresh}
                icon={mdiRefresh}
                name="Refresh"
                loading={isRefreshing}
                keybinding="R"
              />
              <SelectSmall
                id="scope"
                value={showAll ? 'all' : 'collection'}
                onChange={event => setParams({ scope: event.target.value === 'all' ? 'all' : null })}
              >
                <option value="collection">My Collection</option>
                <option value="all">All Series</option>
              </SelectSmall>
              <Checkbox
                id="everyChannel"
                isChecked={everyChannel}
                onChange={event => dispatch(setEveryChannel(event.target.checked))}
                label="Every Channel"
                labelRight
                tooltip="Show every channel an episode airs on, not just the preferred one"
              />
              <Checkbox
                id="hideEstimates"
                isChecked={hideEstimates}
                onChange={handleCheckboxChange}
                label="Hide Estimates"
                labelRight
                tooltip="Hide the airings estimated from a schedule's regular slot"
              />
              <Checkbox
                id="showReruns"
                isChecked={showReruns}
                onChange={handleCheckboxChange}
                label="Show Reruns"
                labelRight
                tooltip="Show the reruns, whether the provider marked them or Shoko detected them"
              />
            </div>
            {/* Wraps as one, so the gear never ends up alone. */}
            <div className="ml-auto flex flex-wrap gap-3">
              <MultiStateButton
                className={toolbarGroupClassName}
                activeState={view}
                states={viewStates}
                onStateChange={(newView) => {
                  dispatch(setLastView(newView));
                  setParams({ view: newView === 'season' ? null : newView, browse: null });
                }}
                alternateColor
                compact
              />
              <div className={toolbarGroupClassName}>
                <Button onClick={() => handleStep(-1)} tooltip={`Previous ${unit}`}>
                  <Icon path={mdiChevronLeft} size={1} className="text-panel-icon-action" />
                </Button>
                <Button
                  onClick={() => (isSeasonView ? handleSeasonChange(null) : handleDateChange(null))}
                  tooltip={isSeasonView ? 'Current Season' : 'Today'}
                >
                  <Icon path={mdiCalendarToday} size={1} className="text-panel-icon-action" />
                </Button>
                <Button
                  onClick={() => handleStep(1)}
                  tooltip={isSeasonView && isLastSeason ? 'Later seasons are not announced yet' : `Next ${unit}`}
                  disabled={isSeasonView && isLastSeason}
                >
                  <Icon path={mdiChevronRight} size={1} className="text-panel-icon-action" />
                </Button>
              </div>
              <Button buttonType="secondary" className="self-center p-3" onClick={toggleSettings} tooltip="Settings">
                <Icon path={mdiCog} size={0.8333} />
              </Button>
            </div>
          </div>
        </ShokoPanel>

        <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background p-6">
          {/* The content fades in over its skeleton's place, and again when the view changes. */}
          {isPanelPending
            ? <AgendaViewSkeleton />
            : <FadeIn key={view} className="flex grow flex-col">{renderContent()}</FadeIn>}
        </div>
      </div>

      <AiringScheduleSettingsModal
        show={showSettings}
        onClose={toggleSettings}
        channels={filterChannels}
        onHide={channelFilter.hide}
        onShow={channelFilter.show}
      >
        <SelectSmall
          id="kind"
          label="Airing Kind"
          className="gap-x-2"
          value={kind}
          onChange={event => setParams({ kind: event.target.value === 'All' ? null : event.target.value })}
        >
          {kindOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectSmall>
        <SelectSmall
          id="provider"
          label="Provider"
          className="gap-x-2"
          value={providerId}
          onChange={event => setParams({ provider: event.target.value || null })}
        >
          <option value="">All Providers</option>
          {providersQuery.data?.map(provider => <option key={provider.ID} value={provider.ID}>{provider.Name}</option>)}
        </SelectSmall>
      </AiringScheduleSettingsModal>
    </AiringProvidersContext.Provider>
  );
};

export default AiringSchedule;
