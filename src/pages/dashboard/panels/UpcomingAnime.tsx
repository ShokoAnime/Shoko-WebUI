import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { useGetDashboardAniDBCalendarQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';
import DashboardTitleToggle from '@/pages/dashboard/components/DashboardTitleToggle';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const UpcomingAnime = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const [showAll, setShowAll] = useState(false);
  const localItems = useGetDashboardAniDBCalendarQuery({ showAll: false });
  const items = useGetDashboardAniDBCalendarQuery({ showAll: true });

  return (
    <ShokoPanel
      title={
        <DashboardTitleToggle
          title="Upcoming Anime"
          mainTitle="My Collection"
          secondaryTitle="All"
          secondaryActive={showAll}
          setSecondaryActive={setShowAll}
        />
      }
      editMode={layoutEditMode}
      isFetching={showAll ? items.isLoading : localItems.isLoading}
    >
      <div className="shoko-scrollbar relative flex">
        <TransitionDiv show={!showAll} className="absolute flex w-full">
          {(localItems.data?.length ?? 0) > 0
            ? localItems.data?.map(item => (
              <EpisodeDetails episode={item} showDate key={item.IDs.ID} isInCollection={item.IDs.ShokoFile !== null} />
            ))
            : (
              <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Start A Currently Airing Series To Populate This Section.</div>
              </div>
            )}
        </TransitionDiv>
        <TransitionDiv show={showAll} className="absolute flex w-full">
          {(items.data?.length ?? 0) > 0
            ? items.data?.map(item => (
              <EpisodeDetails episode={item} showDate key={item.IDs.ID} isInCollection={item.IDs.ShokoFile !== null} />
            ))
            : (
              <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
                <div>No Upcoming Anime.</div>
                <div>Enable Calendar To Populate This Section</div>
              </div>
            )}
        </TransitionDiv>
      </div>
    </ShokoPanel>
  );
};

export default UpcomingAnime;
