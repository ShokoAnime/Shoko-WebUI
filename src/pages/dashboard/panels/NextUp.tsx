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
    <ShokoPanel title="Next Up" isFetching={items.isLoading} editMode={layoutEditMode}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar pb-5">
        {(items.data?.length ?? 0) > 0
          ? items.data?.map(item => <EpisodeDetails episode={item} key={item.IDs.ID} />)
          : <div className="flex justify-center font-semibold mt-4 w-full">No next up episodes!</div>
        }
      </div>
    </ShokoPanel>
  );
};

export default NextUp;
