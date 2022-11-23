import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import EpisodeDetails from '../components/EpisodeDetails';

import { useGetDashboardContinueWatchingEpisodesQuery } from '../../../core/rtkQuery/splitV3Api/dashboardApi';

const ContinueWatching = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetDashboardContinueWatchingEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Continue Watching" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex shoko-scrollbar">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : <div className="flex justify-center font-semibold mt-4 w-full">No episodes in-progress to continue watching!</div>
        }
      </div>
    </ShokoPanel>
  );
};

export default ContinueWatching;
