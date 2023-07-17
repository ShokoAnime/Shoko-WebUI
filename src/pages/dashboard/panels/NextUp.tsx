import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetDashboardNextUpEpisodesQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';
import EpisodeDetails from '../components/EpisodeDetails';

const NextUp = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetDashboardNextUpEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Next Up" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex shoko-scrollbar">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="flex flex-col justify-center mt-4 w-full text-center gap-y-2">
              <div>You&apos;ve Finished Every Series In Progress.</div>
              <div>Time For A New Series?</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default NextUp;
