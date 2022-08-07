import React from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import EpisodeDetails from '../components/EpisodeDetails';

import { useGetDashboardContinueWatchingEpisodesQuery } from '../../../core/rtkQuery/dashboardApi';

const ContinueWatching = () => {
  const items = useGetDashboardContinueWatchingEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Continue Watching" isFetching={items.isLoading}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90">{items.data?.map(item => <EpisodeDetails episode={item} />)}</div>
    </ShokoPanel>
  );
};

export default ContinueWatching;
