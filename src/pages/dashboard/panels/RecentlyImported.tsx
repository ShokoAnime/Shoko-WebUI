import React from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { get } from 'lodash';

import type { FileDetailedType } from '../../../core/types/api/file';
import Events from '../../../core/events';

const RecentlyImported = () => {
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.mainpage.recentFiles);
  const recentSeriesDetails = useSelector((state: RootState) => state.mainpage.recentSeriesDetails);
  const recentEpisodeDetails = useSelector((state: RootState) => state.mainpage.recentEpisodeDetails);
  
  const getDetails = (fileId: number, seriesId: number, episodeId: number) => dispatch(
    { type: Events.MAINPAGE_RECENT_FILE_DETAILS, payload: { fileId, seriesId, episodeId } },
  );

  const handleLoadDetails = (item: FileDetailedType) => {
    const { SeriesIDs } = item;
    getDetails(item.ID, SeriesIDs[0].SeriesID.ID, SeriesIDs[0].EpisodeIDs[0].ID);
  };

  const renderPlaceholder = (item: FileDetailedType) => (
    <div key={`placeholder-${item.ID}`} className="h-80 w-56 shrink-0 flex justify-center items-center" onClick={() => { handleLoadDetails(item); }}>
      <div><Icon path={mdiLoading} spin size={1} /></div>
    </div>
  );

  const renderDetails = (item) => { 
    const seriesData = get(recentSeriesDetails, get(item, 'SeriesIDs.0.SeriesID.ID', '0'), null);
    const episodeData = get(recentEpisodeDetails, get(item, 'SeriesIDs.0.EpisodeIDs.0.ID', '0'), null);
    const series = seriesData?.details;
    const episode = episodeData?.details;
    
    if (!series || !episode) { 
      return renderPlaceholder(item); 
    }
    
    return (<div key={`file-${item.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
      <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${series.SeriesImageSource}/Poster/${series.SeriesImageID}')` }} className="h-80 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2" />
      <p className="truncate text-center text-base font-semibold" title={series.SeriesName}>{series.SeriesName}</p>
      <p className="truncate text-center text-sm" title={`${episode.EpisodeNumber} - ${episode.EpisodeName}`}>{episode.EpisodeNumber} - {episode.EpisodeName}</p>
    </div>); 
  };
  
  const haveSeries = item => get(recentSeriesDetails, get(item, 'SeriesIDs.0.SeriesID.ID', '0'), null) !== null;
  const haveEpisode = item => get(recentEpisodeDetails, get(item, 'SeriesIDs.0.EpisodeIDs.0.ID', '0'), null) !== null;
  
  return (
    <ShokoPanel title="Recently Imported">
      <div className="flex flex-nowrap overflow-x-auto shoko-scrollbar h-90 pb-5">{items.map(item => haveSeries(item) && haveEpisode(item) ? renderDetails(item) : renderPlaceholder(item))}</div>
    </ShokoPanel>
  );
};

export default RecentlyImported;