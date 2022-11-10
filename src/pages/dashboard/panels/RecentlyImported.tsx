import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';
import SeriesDetails from '../components/SeriesDetails';

import {
  useGetDashboardRecentlyAddedEpisodesQuery,
  useGetDashboardRecentlyAddedSeriesQuery,
} from '../../../core/rtkQuery/dashboardApi';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({ pageSize: 20 });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({ pageSize: 30 });

  return (
    <ShokoPanel title={<DashboardTitleToggle title="Recently Imported" mainTitle="Episodes" secondaryTitle="Series" secondaryActive={showSeries} setSecondaryActive={setShowSeries} />} editMode={layoutEditMode}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{showSeries ? (
        series.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />)
      ) : (
        episodes.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
      )}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;
