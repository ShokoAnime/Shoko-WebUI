import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';
import SeriesDetails from '../components/SeriesDetails';

const RecentlyImported = () => {
  const [showSeries, setShowSeries] = useState(false);
  const episodes = useSelector((state: RootState) => state.mainpage.recentEpisodes);
  const series = useSelector((state: RootState) => state.mainpage.recentSeries);

  return (
    <ShokoPanel title="Recently Imported" titleTabs={<DashboardTitleToggle mainTitle="Episodes" secondaryTitle="Series" secondaryActive={showSeries} setSecondaryActive={setShowSeries} />}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{showSeries ? (
        series.map(item => <SeriesDetails series={item} />)
      ) : (
        episodes.map(item => <EpisodeDetails episode={item} />)
      )}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;