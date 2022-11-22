import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import DashboardTitleToggle from '../components/DashboardTitleToggle';
import EpisodeDetails from '../components/EpisodeDetails';
import TransitionDiv from '../../../components/TransitionDiv';

import { useGetDashboardAniDBCalendarQuery } from '../../../core/rtkQuery/dashboardApi';

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showAll, setShowAll] = useState(false);
  const localItems = useGetDashboardAniDBCalendarQuery({ showAll: false });
  const items = useGetDashboardAniDBCalendarQuery({ showAll: true });

  return (
    <ShokoPanel
      title={<DashboardTitleToggle title="Upcoming Anime" mainTitle="My Collection" secondaryTitle="All" secondaryActive={showAll} setSecondaryActive={setShowAll} />}
      editMode={layoutEditMode}
      isFetching={showAll ? items.isLoading : localItems.isLoading}
    >
      <div className="flex relative shoko-scrollbar">
        <TransitionDiv show={!showAll} className="flex absolute">
          {(localItems.data?.length ?? 0) > 0
            ? localItems.data?.map(item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} isInCollection={item.IDs.ShokoFile !== null} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No upcoming anime!</div>
          }
        </TransitionDiv>
        <TransitionDiv show={showAll} className="flex absolute">
          {(items.data?.length ?? 0) > 0
            ? items.data?.map(item =><EpisodeDetails episode={item} showDate key={item.IDs.ID} isInCollection={item.IDs.ShokoFile !== null} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No upcoming anime!</div>
          }
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
