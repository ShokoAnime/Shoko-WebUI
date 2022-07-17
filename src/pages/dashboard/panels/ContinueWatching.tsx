import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React from 'react';
import EpisodeDetails from '../components/EpisodeDetails';

const ContinueWatching = () => {
  const items = useSelector((state: RootState) => state.mainpage.continueWatching);
  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.continueWatching);

  return (
    <ShokoPanel title="Continue Watching" isFetching={!hasFetched}>
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90">{items.map(item => <EpisodeDetails episode={item} />)}</div>
    </ShokoPanel>
  );
};

export default ContinueWatching;