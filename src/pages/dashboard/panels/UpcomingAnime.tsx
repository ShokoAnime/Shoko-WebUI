import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { map } from 'lodash';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useDashboardCalendarQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

type TabType = 'collection_only' | 'all';
const tabStates: { label?: string, value: TabType }[] = [
  { label: 'My Collection', value: 'collection_only' },
  { label: 'All', value: 'all' },
];

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [currentTab, setCurrentTab] = useState<TabType>(tabStates[0].value);
  const handleTabChange = useEventCallback((newTab: TabType) => setCurrentTab(newTab));

  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const calendarQuery = useDashboardCalendarQuery({ showAll: false, includeRestricted: !hideR18Content });
  const calendarAllQuery = useDashboardCalendarQuery({ showAll: true, includeRestricted: !hideR18Content });

  return (
    <ShokoPanel
      title="Upcoming Anime"
      editMode={layoutEditMode}
      isFetching={currentTab === 'all' ? calendarAllQuery.isPending : calendarQuery.isPending}
      options={
        <MultiStateButton activeState={currentTab} states={tabStates} onStateChange={handleTabChange} alternateColor />
      }
      contentClassName="relative"
    >
      <TransitionDiv
        show={currentTab !== 'all'}
        className="absolute flex size-full gap-x-6"
      >
        {(!calendarQuery.data || calendarQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
            <div>No Upcoming Anime.</div>
            <div>Start A Currently Airing Series To Populate This Section.</div>
          </div>
        )}

        {map(
          calendarQuery.data,
          item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} />,
        )}
      </TransitionDiv>

      <TransitionDiv
        show={currentTab === 'all'}
        className="absolute flex size-full gap-x-6"
      >
        {(!calendarAllQuery.data || calendarAllQuery.data.length === 0) && (
          <div className="flex size-full flex-col justify-center gap-y-2 pb-10 text-center">
            <div>No Upcoming Anime.</div>
            <div>Enable Calendar To Populate This Section</div>
          </div>
        )}

        {map(
          calendarAllQuery.data,
          item => (
            <EpisodeDetails episode={item} showDate key={item.IDs.ID} isInCollection={item.IDs.ShokoSeries !== null} />
          ),
        )}
      </TransitionDiv>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
