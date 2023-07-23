import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useGetDashboardContinueWatchingEpisodesQuery } from '@/core/rtkQuery/splitV3Api/dashboardApi';
import EpisodeDetails from '../components/EpisodeDetails';

const ContinueWatching = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetDashboardContinueWatchingEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Continue Watching" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex shoko-scrollbar">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : (
            <div className="flex flex-col justify-center mt-4 w-full text-center gap-y-2">
              <div>No Episodes In Progress.</div>
              <div>Stop An Episode During Playback To Populate This Section.</div>
            </div>
          )}
      </div>
    </ShokoPanel>
  );
};

export default ContinueWatching;
