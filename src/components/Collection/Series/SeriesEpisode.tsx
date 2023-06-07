import React, { useState } from 'react';
import { get } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiEyeCheckOutline,
  mdiEyeOffOutline,
  mdiLoading,
  mdiPencilCircleOutline,
} from '@mdi/js';
import AnimateHeight from 'react-animate-height';

import type { ImageType } from '@/core/types/api/common';
import type { EpisodeType } from '@/core/types/api/episode';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import {
  useLazyGetEpisodeFilesQuery, usePostEpisodeHiddenMutation,
  usePostEpisodeWatchedMutation,
} from '@/core/rtkQuery/splitV3Api/episodeApi';
import Button from '@/components/Input/Button';
import { EpisodeDetails } from './EpisodeDetails';
import { EpisodeFiles } from './EpisodeFiles';

type Props = {
  episode: EpisodeType;
};

const getThumbnailUrl = (episode: EpisodeType) => {
  const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};

const StateIcon = ({ icon, show }: { icon: string, show: boolean }) => (
  show
    ? (
      <div className="px-3 py-2 bg-background/85 shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-md flex items-center justify-center text-highlight-2">
        <Icon path={icon} size={1} />
      </div>
    ) : null
);

const StateButton = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <Button className={active ? 'text-highlight-2' : 'text-font-main'} onClick={onClick}>
    <Icon path={icon} size="2rem" />
  </Button>
);

const SeriesEpisode = ({ episode }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const episodeId = get(episode, 'IDs.ID', 0).toString();

  const [getEpisodeFiles, episodeFilesResult] = useLazyGetEpisodeFilesQuery();
  const [markWatched] = usePostEpisodeWatchedMutation();
  const [markHidden] = usePostEpisodeHiddenMutation();

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
        <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="min-w-[22.3125rem] h-[13rem] rounded-md border border-background-border relative group" hidePlaceholderOnHover zoomOnHover>
          <div className="absolute right-3 top-3 z-10 group-hover:opacity-0 pointer-events-none transition-opacity">
            <StateIcon icon={mdiEyeCheckOutline} show={episode.Watched !== null} />)
            <StateIcon icon={mdiEyeOffOutline} show={episode.IsHidden} />)
          </div>
          <div className="pointer-events-none opacity-0 flex bg-background/50 h-full justify-between p-3 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
            <div>
              <StateButton icon={mdiPencilCircleOutline} active={false} onClick={() => {}} />
            </div>
            <div className="flex flex-col gap-y-8">
              <StateButton icon={mdiEyeCheckOutline} active={episode.Watched !== null} onClick={() => markWatched({ episodeId, watched: episode.Watched === null })} />
              <StateButton icon={mdiEyeOffOutline} active={episode.IsHidden} onClick={() => markHidden({ episodeId, hidden: !episode.IsHidden })} />
            </div>
          </div>
        </BackgroundImagePlaceholderDiv>
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
