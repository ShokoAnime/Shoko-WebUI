import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React from 'react';
import { DashboardEpisodeDetailsType } from '../../../core/types/api/dashboard';

const ContinueWatching = () => {
  const items = useSelector((state: RootState) => state.mainpage.continueWatching);

  const renderDetails = (item: DashboardEpisodeDetailsType ) => {

    return (<div key={`file-${item.IDs.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${item.SeriesPoster.Source}/Poster/${item.SeriesPoster.ID}')` }} className="h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black" />
      <p className="truncate text-base font-semibold" title={item.SeriesTitle}>{item.SeriesTitle}</p>
      <p className="truncate text-sm" title={`${item.Number} - ${item.Title}`}>{item.Number} - {item.Title}</p>
    </div>);
  };
  
  return (
    <ShokoPanel title="Continue Watching">
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90">{items.map(item => renderDetails(item))}</div>
    </ShokoPanel>
  );
};

export default ContinueWatching;