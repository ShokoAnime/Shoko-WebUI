import React, { useState } from 'react';
import { get } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import AnimateHeight from 'react-animate-height';

import type { ImageType } from '@/core/types/api/common';
import type { EpisodeType } from '@/core/types/api/episode';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { EpisodeDetails } from './EpisodeDetails';
import { EpisodeFiles } from './EpisodeFiles';
import { useLazyGetEpisodeFilesQuery } from '@/core/rtkQuery/splitV3Api/episodeApi';

type Props = {
  episode: EpisodeType;
};

const getThumbnailUrl = (episode: EpisodeType) => {
  const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};

const SeriesEpisode = ({ episode }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const episodeId = get(episode, 'IDs.ID', 0).toString();

  const [getEpisodeFiles, episodeFilesResult] = useLazyGetEpisodeFilesQuery();

  const handleExpand = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    await getEpisodeFiles({ episodeId, includeDataFrom: ['AniDB'], includeMediaInfo: true }, true);
    setIsOpen(true);
  };

  return (
    <React.Fragment>
      <div className="flex gap-x-8 p-8 items-center z-10">
        <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="min-w-[22.3125rem] h-[13rem] rounded-md border border-background-border relative"/>
        <EpisodeDetails episode={episode} />
      </div>
      <div className="flex justify-center py-4 gap-x-4 border-background-border border-t-2 cursor-pointer font-semibold" onClick={handleExpand}>
        File Info
        <Icon
          path={episodeFilesResult.isFetching ? mdiLoading : mdiChevronDown}
          size={1}
          rotate={isOpen ? 180 : 0}
          className="transition-transform"
          spin={episodeFilesResult.isFetching}
        />
      </div>
      <AnimateHeight height={isOpen ? 'auto' : 0}>
        <EpisodeFiles episodeFiles={episodeFilesResult.data ?? []} />
      </AnimateHeight>
    </React.Fragment>
  );
};

export default React.memo(SeriesEpisode);