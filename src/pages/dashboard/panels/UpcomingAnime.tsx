import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React, { useState } from 'react';
import Events from '../../../core/events';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';

const UpcomingAnime = () => {
  const items = useSelector((state: RootState) => state.mainpage.upcomingAnime);
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.upcomingAnime);
  const [showAll, setShowAll] = useState(false);

  const dispatch = useDispatch();

  const updatePanel = (state: boolean) => {
    setShowAll(state);
    dispatch({ type: Events.DASHBOARD_UPCOMING_ANIME, payload: state });
  };

  return (
    <ShokoPanel title="Upcoming Anime" isFetching={!hasFetched} titleTabs={<DashboardTitleToggle mainTitle="My Collection" secondaryTitle="All" secondaryActive={showAll} setSecondaryActive={updatePanel} />}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">
        {items.length === 0 && <div className="flex justify-center font-semibold mt-4">It Looks like Your Not Watching Anything Currently Airing.</div>}
        {items.map(item => <EpisodeDetails episode={item} showDate />)}
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;