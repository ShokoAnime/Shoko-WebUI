import React, { useEffect, useState } from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useGetEpisodeQuery } from '@/core/rtkQuery/splitV3Api/episodeApi';
import { get } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { EpisodeTvDBType } from '@/core/types/api/episode';
import { ImageType } from '@/core/types/api/common';
import { EpisodeDetails } from '../items/EpisodeDetails';
import { EpisodeFiles } from '@/pages/collection/items/EpisodeFiles';

const Heading = episode => (
  <React.Fragment>
    <Link className="text-highlight-1" to="../episodes">Episodes</Link>
    <span className="px-2">&gt;</span>
    <span>Episode {episode.AniDB.EpisodeNumber} - {episode.Name}</span>
  </React.Fragment>
);

const getThumbnailUrl = (episode: EpisodeTvDBType[]) => {
  const thumbnail = get<EpisodeTvDBType[], string, ImageType | null>(episode, '0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};

const SeriesEpisodeDetails = () => {
  const { episodeId } = useParams();
  if (!episodeId) { return null; }
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const episodeData = useGetEpisodeQuery({ episodeId, includeDataFrom: ['AniDB', 'TvDB'] });
  const episode = episodeData.data;
  
  
  useEffect(() => {
    if (!episode || !episode.TvDB) { return; }
    if (get(episode, 'TvDB.0.Thumbnail', null) === null) { return; }
    setThumbnailUrl(getThumbnailUrl(episode.TvDB));
  }, [episode]);
  
  if (!episode) { return null; }
  
  return (
    <div className="flex flex-col">
      <ShokoPanel title={Heading(episode)} className="flex flex-col grow">
        <div className="flex space-x-8">
          <BackgroundImagePlaceholderDiv imageSrc={thumbnailUrl}
                                         className="h-[15.8125rem] min-w-[28.125rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2"/>
          <EpisodeDetails episode={episode}/>
        </div>
      </ShokoPanel>
      <EpisodeFiles show episodeId={episodeId} resetHeight={() => {}}/>
    </div>
  );
};

export default SeriesEpisodeDetails;