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
          : <div className="flex justify-center font-semibold mt-4 w-full">Congrats on Not Stopping an Episode Halfway Through.</div>}
      </div>
    </ShokoPanel>
  );
};

export default ContinueWatching;
