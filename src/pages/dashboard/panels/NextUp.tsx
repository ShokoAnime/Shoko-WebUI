import React from 'react';
import { useSelector } from 'react-redux';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetDashboardNextUpEpisodesQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';
import EpisodeDetails from '@/pages/dashboard/components/EpisodeDetails';

import type { RootState } from '@/core/store';

const NextUp = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetDashboardNextUpEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Next Up" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="shoko-scrollbar flex">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="mt-4 flex w-full flex-col justify-center gap-y-2 text-center">
              <div>You&apos;ve Finished Every Series In Progress.</div>
              <div>Time For A New Series?</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default NextUp;
