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
import TransitionDiv from '../../../components/TransitionDiv';

const RecentlyImported = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showSeries, setShowSeries] = useState(false);
  const series = useGetDashboardRecentlyAddedSeriesQuery({ pageSize: 20 });
  const episodes = useGetDashboardRecentlyAddedEpisodesQuery({ pageSize: 30 });

  return (
    <ShokoPanel title={<DashboardTitleToggle title="Recently Imported" mainTitle="Episodes" secondaryTitle="Series" secondaryActive={showSeries} setSecondaryActive={setShowSeries} />} editMode={layoutEditMode}>
      <TransitionDiv show={!showSeries} className="flex flex-nowrap overflow-x-auto shoko-scrollbar pb-5 absolute w-full">
        {(episodes.data?.length ?? 0) > 0 ? episodes.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />) : <div className="flex justify-center font-semibold mt-4 w-full">No recently imported episodes!</div>}
      </TransitionDiv>
      <TransitionDiv show={showSeries} className="flex flex-nowrap overflow-x-auto shoko-scrollbar pb-5 absolute w-full">
        {(series.data?.length ?? 0) > 0 ? series.data?.map(item => <SeriesDetails series={item} key={item.IDs.ID} />) : <div className="flex justify-center font-semibold mt-4 w-full">No recently imported series!</div>}
      </TransitionDiv>
    </ShokoPanel>
  );
};

export default RecentlyImported;
