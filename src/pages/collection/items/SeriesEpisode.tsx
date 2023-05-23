import React, { useEffect, useState } from 'react';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { EpisodeDetails } from '@/pages/collection/items/EpisodeDetails';
import { get } from 'lodash';

import type { ImageType } from '@/core/types/api/common';
import type { EpisodeType } from '@/core/types/api/episode';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { EpisodeFiles } from '@/pages/collection/items/EpisodeFiles';

type Props = {
  episode: EpisodeType;
  resetHeight: () => void;
};

const getThumbnailUrl = (episode: EpisodeType) => {
  const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};
export const SeriesEpisode = ({ episode, resetHeight }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const episodeId = get(episode, 'IDs.ID', '0');
  
  useEffect(() => {
    resetHeight();
  }, [isOpen]);
  
  return (
    <React.Fragment>
      <div className="flex flex-col rounded bg-background-alt/25 border-background-border border mb-4">
        <div className="flex space-x-8 p-8">
          <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="h-[8.4375rem] min-w-[15rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2"/>
          <EpisodeDetails episode={episode}/>
        </div>
        <div className="flex justify-center py-4 space-x-4 border-background-border border-t cursor-pointer" onClick={() => { setIsOpen(!isOpen); }}>
          File Info 
          <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={1} />
        </div>
        <EpisodeFiles show={isOpen} episodeId={`${episodeId}`} resetHeight={resetHeight} />
      </div>
    </React.Fragment>
  );
};