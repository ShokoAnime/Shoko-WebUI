import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useDashboardCalendarQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

type TabStateTypes = 'collection_only' | 'all';
const tabStates: { label?: string, value: TabStateTypes }[] = [
  { label: 'My Collection', value: 'collection_only' },
  { label: 'All', value: 'all' },
];

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [currentTab, setCurrentTab] = useState<TabStateTypes>(tabStates[0].value);
  const handleTabChange = useEventCallback((newTab: TabStateTypes) => setCurrentTab(newTab));

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
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={currentTab !== 'all'} className="absolute flex w-full">
          {(calendarQuery.data?.length ?? 0) > 0
            ? calendarQuery.data?.map(item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} />)
            : (
              <div className="flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Start A Currently Airing Series To Populate This Section.</div>
              </div>
            )}
        </TransitionDiv>
        <TransitionDiv
          show={currentTab === 'all'}
          className={cx('shoko-scrollbar flex', calendarAllQuery.data?.length === 0 && ('h-full pb-[3.5rem]'))}
        >
          {(calendarAllQuery.data?.length ?? 0) > 0
            ? calendarAllQuery.data?.map(item => (
              <EpisodeDetails
                episode={item}
                showDate
                key={item.IDs.ID}
                isInCollection={item.IDs.ShokoSeries !== null}
              />
            ))
            : (
              <div className="flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Enable Calendar To Populate This Section</div>
              </div>
            )}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
