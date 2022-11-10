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
    <ShokoPanel isFetching={items.isFetching} title={<DashboardTitleToggle title="Upcoming Anime" mainTitle="My Collection" secondaryTitle="All" secondaryActive={showAll} setSecondaryActive={setShowAll} />} editMode={layoutEditMode}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">
        {items.data?.length === 0 && <div className="flex justify-center font-semibold mt-4">It looks like you are not watching anything currently airing.</div>}
        {items.data?.map(item => <EpisodeDetails episode={item} showDate key={item.IDs.ID} />)}

        <TransitionDiv show={!showAll} className="flex flex-nowrap overflow-x-auto shoko-scrollbar pb-5 absolute w-full">
          {(localItems.data?.length ?? 0) > 0
            ? localItems.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No upcoming anime!</div>
          }
        </TransitionDiv>
        <TransitionDiv show={showAll} className="flex flex-nowrap overflow-x-auto shoko-scrollbar pb-5 absolute w-full">
          {(items.data?.length ?? 0) > 0
            ? items.data?.map(item =><EpisodeDetails episode={item} showDate key={item.IDs.ID} />)
            : <div className="flex justify-center font-semibold mt-4 w-full">No upcoming anime!</div>
          }
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
