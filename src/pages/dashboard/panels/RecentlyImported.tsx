import React from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';

import { DashboardEpisodeDetailsType } from '../../../core/types/api/dashboard';

const RecentlyImported = () => {
  const items = useSelector((state: RootState) => state.mainpage.recentEpisodes);

  const renderDetails = (item: DashboardEpisodeDetailsType) => {
    const {
      Title: episodeName,
      Number: episodeNumber,
      SeriesPoster: {
        Source: seriesImageSource,
        ID: seriesImageID,
      },
      SeriesTitle: seriesTitle,
    } = item;
    return (<div key={`file-${item.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${seriesImageSource}/Poster/${seriesImageID}')` }} className="h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2" />
      <p className="truncate text-center text-base font-semibold" title={seriesTitle}>{seriesTitle}</p>
      <p className="truncate text-center text-sm" title={`${episodeNumber} - ${episodeName}`}>{episodeNumber} - {episodeName}</p>
    </div>);
  };

  return (
    <ShokoPanel title="Recently Imported">
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{items.map(item => renderDetails(item))}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;