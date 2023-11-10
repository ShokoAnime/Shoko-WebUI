import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import {
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} from '@/core/rtkQuery/splitV3Api/dashboardApi';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';
import SeriesDetails from '@/pages/dashboard/components/SeriesDetails';

import type { RootState } from '@/core/store';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({ pageSize: 20 });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({ pageSize: 30 });

  return (
    <ShokoPanel
      title={
        <DashboardTitleToggle
          title="Recently Imported"
          mainTitle="Episodes"
          secondaryTitle="Series"
          secondaryActive={showSeries}
          setSecondaryActive={setShowSeries}
        />
      }
      editMode={layoutEditMode}
      isFetching={showSeries ? series.isLoading : episodes.isLoading}
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={!showSeries} className="absolute flex">
          {(episodes.data?.length ?? 0) > 0
            ? episodes.data?.map(item => (
              <EpisodeDetails episode={item} key={`${item.IDs.ShokoEpisode}-${item.IDs.ShokoFile}`} />
            ))
            : <div className="mt-4 flex w-full justify-center font-semibold">No Recently Imported Episodes!</div>}
        </TransitionDiv>
        <TransitionDiv show={showSeries} className="absolute flex">
          {(series.data?.length ?? 0) > 0
            ? series.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
            : <div className="mt-4 flex w-full justify-center font-semibold">No Recently Imported Series!</div>}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
