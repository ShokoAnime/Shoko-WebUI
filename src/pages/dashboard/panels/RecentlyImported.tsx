import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} from '@/core/rtkQuery/splitV3Api/dashboardApi';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';
import SeriesDetails from '../components/SeriesDetails';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({ pageSize: 20 });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({ pageSize: 30 });

  return (
    <ShokoPanel
      title={<DashboardTitleToggle title="Recently Imported" mainTitle="Episodes" secondaryTitle="Series" secondaryActive={showSeries} setSecondaryActive={setShowSeries} />}
      editMode={layoutEditMode}
      isFetching={showSeries ? series.isLoading : episodes.isLoading}
    >
      <div className="flex relative shoko-scrollbar">
        <TransitionDiv show={!showSeries} className="flex absolute">
          {(episodes.data?.length ?? 0) > 0
            ? episodes.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={showSeries} className="flex absolute">
          {(series.data?.length ?? 0) > 0
            ? series.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
