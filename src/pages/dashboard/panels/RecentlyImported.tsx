import React, { useState } from 'react';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';
import SeriesDetails from '../components/SeriesDetails';

import {
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} from '../../../core/rtkQuery/dashboardApi';

const RecentlyImported = () => {
  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({ pageSize: 20 });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({ pageSize: 30 });

  return (
    <ShokoPanel title={<DashboardTitleToggle title="Recently Imported" mainTitle="Episodes" secondaryTitle="Series" secondaryActive={showSeries} setSecondaryActive={setShowSeries} />}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{showSeries ? (
        series.data?.map(item => <SeriesDetails series={item} />)
      ) : (
        episodes.data?.map(item => <EpisodeDetails episode={item} />)
      )}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
