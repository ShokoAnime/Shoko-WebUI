import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiEyeCheckOutline, mdiEyeOffOutline, mdiLoading, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { get } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import {
  useLazyGetEpisodeFilesQuery,
  usePostEpisodeHiddenMutation,
  usePostEpisodeWatchedMutation,
} from '@/core/rtkQuery/splitV3Api/episodeApi';
import useEpisodeThumbnail from '@/hooks/useEpisodeThumbnail';

import EpisodeDetails from './EpisodeDetails';
import EpisodeFiles from './EpisodeFiles';

import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  episode: EpisodeType;
};

const StateIcon = ({ icon, show }: { icon: string, show: boolean }) => (
  show
    ? (
      <div className="flex items-center justify-center rounded-md bg-panel-background-transparent px-3 py-2 text-panel-important shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <Icon path={icon} size={1} />
      </div>
    )
    : null
);

const StateButton = ({ active, icon, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <Button className={active ? 'text-panel-important' : 'text-panel-text'} onClick={onClick}>
    <Icon path={icon} size="2rem" />
  </Button>
);

const SeriesEpisode = ({ episode }: Props) => {
  const thumbnail = useEpisodeThumbnail(episode);
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
    <>
      <div className="z-10 flex items-center gap-x-8 p-8">
        <BackgroundImagePlaceholderDiv
          image={thumbnail}
          className="group relative h-[13rem] min-w-[22.3125rem] rounded-md border border-panel-border"
          hidePlaceholderOnHover
          zoomOnHover
        >
          <div className="pointer-events-none absolute right-3 top-3 z-10 transition-opacity group-hover:opacity-0">
            <StateIcon icon={mdiEyeCheckOutline} show={episode.Watched !== null} />
            <StateIcon icon={mdiEyeOffOutline} show={episode.IsHidden} />
          </div>
          <div className="pointer-events-none z-10 flex h-full justify-between bg-overlay-background p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <div>
              <StateButton icon={mdiPencilCircleOutline} active={false} onClick={() => {}} />
            </div>
            <div className="flex flex-col gap-y-8">
              <StateButton
                icon={mdiEyeCheckOutline}
                active={episode.Watched !== null}
                onClick={() => markWatched({ episodeId, watched: episode.Watched === null })}
              />
              <StateButton
                icon={mdiEyeOffOutline}
                active={episode.IsHidden}
                onClick={() => markHidden({ episodeId, hidden: !episode.IsHidden })}
              />
            </div>
          </div>
        </BackgroundImagePlaceholderDiv>
        <EpisodeDetails episode={episode} />
      </div>
      <div
        className="flex cursor-pointer justify-center gap-x-4 border-t-2 border-panel-border py-4 font-semibold"
        onClick={handleExpand}
      >
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
    </>
  );
};

export default React.memo(SeriesEpisode);
