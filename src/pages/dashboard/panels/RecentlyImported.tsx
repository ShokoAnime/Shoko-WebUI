import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useDashboardRecentlyAddedEpisodesQuery,
  useDashboardRecentlyAddedSeriesQuery,
} from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { RootState } from '@/core/store';

type TabType = 'Series' | 'Episodes';
const tabStates: { label?: string, value: TabType }[] = [
  { value: 'Episodes' },
  { value: 'Series' },
];

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const {
    hideR18Content,
    recentlyImportedEpisodesCount,
    recentlyImportedSeriesCount,
  } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const recentSeriesQuery = useDashboardRecentlyAddedSeriesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedSeriesCount,
  });
  const recentEpisodesQuery = useDashboardRecentlyAddedEpisodesQuery({
    includeRestricted: !hideR18Content,
    pageSize: recentlyImportedEpisodesCount,
  });

  const [currentTab, setCurrentTab] = useState<TabType>(tabStates[0].value);
  const handleTabChange = useEventCallback((newTab: TabType) => setCurrentTab(newTab));

  return (
    <ShokoPanel
      title="Recently Imported"
      editMode={layoutEditMode}
      isFetching={currentTab === 'Series' ? recentSeriesQuery.isPending : recentEpisodesQuery.isPending}
      options={
        <MultiStateButton activeState={currentTab} states={tabStates} onStateChange={handleTabChange} alternateColor />
      }
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={currentTab !== 'Series'} className="absolute flex w-full">
          {(recentEpisodesQuery.data?.length ?? 0) > 0
            ? recentEpisodesQuery.data?.map(item => (
              <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />
            ))
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={currentTab === 'Series'} className="absolute flex w-full">
          {(recentSeriesQuery.data?.length ?? 0) > 0
            ? recentSeriesQuery.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="flex w-full justify-center font-semibold">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
