import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import EpisodeDetails from '../components/EpisodeDetails';

import { useGetDashboardNextUpEpisodesQuery } from '../../../core/rtkQuery/dashboardApi';

const NextUp = () => {
  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const items = useGetDashboardNextUpEpisodesQuery({ pageSize: 20 });

  return (
    <ShokoPanel title="Next Up" isFetching={items.isLoading} disableClick={layoutEditMode}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90">{items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)}</div>
    </ShokoPanel>
  );
};

export default NextUp;
