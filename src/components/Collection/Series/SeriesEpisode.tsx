import React from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiEyeCheckOutline, mdiEyeOffOutline, mdiLoading, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get } from 'lodash';
import { useToggle } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import { useHideEpisodeMutation, useWatchEpisodeMutation } from '@/core/react-query/episode/mutations';
import { useEpisodeFilesQuery } from '@/core/react-query/episode/queries';
import useEpisodeThumbnail from '@/hooks/useEpisodeThumbnail';
import useEventCallback from '@/hooks/useEventCallback';

import EpisodeDetails from './EpisodeDetails';
import EpisodeFiles from './EpisodeFiles';

import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  animeId?: number;
  episode: EpisodeType;
  nextUp?: boolean;
  page?: number;
};

const StateIcon = ({ icon, show }: { icon: string, show: boolean }) => (
  show
    ? (
      <div className="flex items-center justify-center rounded-md bg-panel-background-transparent px-3 py-2 text-panel-text-important shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <Icon path={icon} size={1} />
      </div>
    )
    : null
);

const StateButton = React.memo((
  { active, icon, onClick, tooltip }: { icon: string, active: boolean, onClick: () => void, tooltip: string },
) => (
  <Button className={active ? 'text-panel-text-important' : 'text-panel-text'} onClick={onClick} tooltip={tooltip}>
    <Icon path={icon} size="2rem" />
  </Button>
));

const SeriesEpisode = React.memo(({ animeId, episode, nextUp, page }: Props) => {
  const thumbnail = useEpisodeThumbnail(episode);
  const [open, toggleOpen] = useToggle(false);
  const episodeId = get(episode, 'IDs.ID', 0);

  const episodeFilesQuery = useEpisodeFilesQuery(
    episodeId,
    { includeDataFrom: ['AniDB'], include: ['AbsolutePaths', 'MediaInfo'] },
    open,
  );
  const { mutate: markWatched } = useWatchEpisodeMutation(page, nextUp);
  const { mutate: markHidden } = useHideEpisodeMutation(nextUp);

  const handleMarkWatched = useEventCallback(() => markWatched({ episodeId, watched: episode.Watched === null }));
  const handleMarkHidden = useEventCallback(() => markHidden({ episodeId, hidden: !episode.IsHidden }));

  return (
    <>
      <div className={cx('z-10 flex items-center gap-x-6', !nextUp && 'p-6')}>
        <BackgroundImagePlaceholderDiv
          image={thumbnail}
          className="group h-[13rem] min-w-[22.3125rem] rounded-md border border-panel-border"
          zoomOnHover
        >
          <div className="pointer-events-none absolute right-3 top-3 z-10 transition-opacity group-hover:opacity-0">
            <StateIcon icon={mdiEyeCheckOutline} show={!!episode.Watched} />
            <StateIcon icon={mdiEyeOffOutline} show={episode.IsHidden} />
          </div>
          <div className="pointer-events-none z-10 flex h-full justify-between bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <div>
              <StateButton icon={mdiPencilCircleOutline} active={false} onClick={() => {}} tooltip="Edit" />
            </div>
            <div className="flex flex-col gap-y-6">
              {episode.Size > 0 && (
                <StateButton
                  icon={mdiEyeCheckOutline}
                  active={!!episode.Watched}
                  onClick={handleMarkWatched}
                  tooltip={`Mark ${episode.Watched ? 'Unwatched' : 'Watched'}`}
                />
              )}
              <StateButton
                icon={mdiEyeOffOutline}
                active={episode.IsHidden}
                onClick={handleMarkHidden}
                tooltip={episode.IsHidden ? 'Unhide Episode' : 'Hide Episode'}
              />
            </div>
          </div>
        </BackgroundImagePlaceholderDiv>
        <EpisodeDetails episode={episode} />
      </div>
      {animeId && episode.Size > 0 && (
        <>
          <div
            className="flex cursor-pointer justify-center gap-x-4 border-t-2 border-panel-border py-4 font-semibold"
            onClick={toggleOpen}
          >
            File Info
            <Icon
              path={episodeFilesQuery.isFetching ? mdiLoading : mdiChevronDown}
              size={1}
              rotate={open ? 180 : 0}
              className="transition-transform"
              spin={episodeFilesQuery.isFetching}
            />
          </div>
          <AnimateHeight height={open && episodeFilesQuery.isSuccess ? 'auto' : 0}>
            <EpisodeFiles animeId={animeId} episodeFiles={episodeFilesQuery.data ?? []} episodeId={episodeId} />
          </AnimateHeight>
        </>
      )}
    </>
  );
});

export default SeriesEpisode;
