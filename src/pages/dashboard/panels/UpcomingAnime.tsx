import { Fragment, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import { produce } from 'immer';
import { map } from 'lodash';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useAiringCalendarQuery, useAiringProvidersByIdQuery } from '@/core/react-query/airing-schedule/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { useSelector } from '@/core/store';
import { dayjs } from '@/core/util';
import { getAiringShokoSeriesId, getLocalTimeZone, toAiringRequestDates } from '@/core/utilities/airingSchedule';
import { AiringProvidersContext } from '@/hooks/useAiringProviderContext';
import useSyncedState from '@/hooks/useSyncedState';
import AiringDetails from '@/pages/dashboard/components/AiringDetails';

import type { AiringCalendarRequestType } from '@/core/react-query/airing-schedule/types';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';
import type { Dayjs } from 'dayjs';

type TabType = 'collection' | 'all';
const tabStates: { label?: string, value: TabType }[] = [
  { label: 'My Collection', value: 'collection' },
  { label: 'All', value: 'all' },
];

/**
 * The server's entries, one per episode and day, as a timeline: past date-only ones first, the timed ones by time,
 * future date-only ones last. A date-only entry of today counts as past. `nowIndex` is where now falls: before the
 * first entry not yet aired.
 */
const orderEntries = (days: Map<string, CalendarEntryType[]> | undefined, now: Dayjs) => {
  const today = now.startOf('day');
  const entries = [...(days?.values() ?? [])].flat();
  const isPast = (entry: CalendarEntryType) => !entry.time.isAfter(entry.isAllDay ? today : now);
  const ordered = [
    ...entries.filter(entry => entry.isAllDay && isPast(entry)),
    ...entries.filter(entry => !entry.isAllDay),
    ...entries.filter(entry => entry.isAllDay && !isPast(entry)),
  ];
  const firstUpcoming = ordered.findIndex(entry => !isPast(entry));

  return { ordered, nowIndex: firstUpcoming === -1 ? ordered.length : firstUpcoming, isAired: isPast };
};

/** Scrolls the list the element sits in sideways, so the element starts at its left edge, without moving the page. */
const scrollToLeftEdge = (element: HTMLElement) => {
  const canScroll = (candidate: HTMLElement) =>
    candidate.scrollWidth > candidate.clientWidth && /auto|scroll/.test(getComputedStyle(candidate).overflowX);
  let scroller = element.parentElement;
  while (scroller && !canScroll(scroller)) scroller = scroller.parentElement;
  if (!scroller) return;
  scroller.scrollLeft += element.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
};

/** The "you are here" mark between the aired and the upcoming airings. */
const NowMarker = () => (
  <div className="flex w-12 shrink-0 flex-col items-center gap-y-2 py-2" data-now-marker>
    <span className="text-center text-xs font-semibold text-panel-text-primary">You Are Here</span>
    <div className="w-0.5 grow rounded-full bg-panel-text-primary" />
  </div>
);

/** The airings with the now mark in place. */
const Timeline = (
  { isAired, nowIndex, ordered, showInCollection, showTime }: ReturnType<typeof orderEntries> & {
    showInCollection: boolean;
    showTime: boolean;
  },
) => (
  <>
    {map(ordered, (entry, index) => (
      <Fragment key={entry.airing.ID}>
        {index === nowIndex && <NowMarker />}
        <AiringDetails
          entry={entry}
          showTime={showTime}
          isInCollection={showInCollection && getAiringShokoSeriesId(entry.airing) !== null}
          isAired={isAired(entry)}
        />
      </Fragment>
    ))}
    {nowIndex === ordered.length && <NowMarker />}
  </>
);

const UpcomingAnime = () => {
  const layoutEditMode = useSelector(state => state.mainpage.layoutEditMode);
  // The airing schedule's Every Channel toggle: off, the server sends each episode's lead airing alone.
  const everyChannel = useSelector(state => state.utilities.airingSchedule.everyChannel);

  const settings = useSettingsQuery().data;
  const {
    hideR18Content,
    upcomingAnimeDays,
    upcomingAnimeShowTimes,
    upcomingAnimeView,
  } = settings.WebUI_Settings.dashboard;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  // Follows the saved view, which the dashboard settings can change too.
  const [currentTab, setCurrentTab] = useSyncedState<TabType>(upcomingAnimeView);

  // The last 12 hours, today and the days ahead, in the browser's time zone. Kept for the widget's life, so the query
  // does not change with the clock.
  const [now] = useState(() => dayjs());
  const start = now.subtract(12, 'hour');
  const end = now.startOf('day').add(upcomingAnimeDays + 1, 'day');
  // The episodes known only by an AniDB air date are included, as the AniDB calendar showed them. The server groups
  // the airings of one episode on one local day into one entry.
  const params: AiringCalendarRequestType = {
    ...toAiringRequestDates(start, end),
    timeZone: getLocalTimeZone(),
    everyChannel,
    includeRestricted: hideR18Content ? 'false' : 'true',
    includeDateOnly: true,
    // No reruns, as the airing schedule shows by default.
    episodeKind: ['Normal', 'Advance'],
    include: ['EpisodeTitle', 'Series', 'Poster'],
  };
  const calendarQuery = useAiringCalendarQuery({ ...params, inCollection: 'only' });
  const calendarAllQuery = useAiringCalendarQuery({ ...params, inCollection: 'true' });
  // Read once here for every airing, which looks up its provider's icon.
  const providersById = useAiringProvidersByIdQuery().data;

  const collection = orderEntries(calendarQuery.data, now);
  const all = orderEntries(calendarAllQuery.data, now);
  const shown = currentTab === 'all' ? all : collection;

  // Once per tab, when its airings are in, scroll so one aired airing shows before the now mark.
  const listRef = useRef<HTMLDivElement>(null);
  const scrolledTabs = useRef(new Set<TabType>());
  useEffect(() => {
    if (shown.ordered.length === 0 || scrolledTabs.current.has(currentTab)) return;
    const marker = listRef.current?.querySelector<HTMLElement>('[data-now-marker]');
    if (!marker) return;
    scrolledTabs.current.add(currentTab);
    const previous = marker.previousElementSibling;
    scrollToLeftEdge(previous instanceof HTMLElement ? previous : marker);
  }, [currentTab, shown.ordered.length]);

  const handleTabChange = (newTab: TabType) => {
    setCurrentTab(newTab);
    const newSettings = produce(settings, (draftState) => {
      draftState.WebUI_Settings.dashboard.upcomingAnimeView = newTab;
    });
    patchSettings(newSettings);
  };

  return (
    <AiringProvidersContext.Provider value={providersById}>
      <ShokoPanel
        title={
          <div className="flex w-full flex-row items-center gap-x-2">
            <span>Upcoming Anime</span>
            <NavLink to="/webui/utilities/airing-schedule">
              <Icon className="text-panel-icon-action" path={mdiChevronRight} size={1} />
            </NavLink>
          </div>
        }
        editMode={layoutEditMode}
        isFetching={currentTab === 'all' ? calendarAllQuery.isPending : calendarQuery.isPending}
        options={
          <MultiStateButton
            activeState={currentTab}
            states={tabStates}
            onStateChange={handleTabChange}
            alternateColor
          />
        }
        contentClassName="relative"
      >
        <TransitionDiv
          show={currentTab !== 'all'}
          className="absolute flex size-full gap-x-6"
        >
          {collection.ordered.length === 0 && (
            <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
              <div>No Upcoming Anime.</div>
              <div>Start A Currently Airing Series To Populate This Section.</div>
            </div>
          )}

          {currentTab !== 'all' && (
            <div ref={listRef} className="contents">
              <Timeline {...collection} showInCollection={false} showTime={upcomingAnimeShowTimes} />
            </div>
          )}
        </TransitionDiv>

        <TransitionDiv
          show={currentTab === 'all'}
          className="absolute flex size-full gap-x-6"
        >
          {all.ordered.length === 0 && (
            <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
              <div>No Upcoming Anime.</div>
              <div>Enable An Airing Schedule Provider To Populate This Section.</div>
            </div>
          )}

          {currentTab === 'all' && (
            <div ref={listRef} className="contents">
              <Timeline {...all} showInCollection showTime={upcomingAnimeShowTimes} />
            </div>
          )}
        </TransitionDiv>
      </ShokoPanel>
    </AiringProvidersContext.Provider>
  );
};

export default UpcomingAnime;
