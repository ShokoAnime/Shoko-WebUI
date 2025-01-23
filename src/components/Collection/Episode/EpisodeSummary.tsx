import React from 'react';
import AnimateHeight from 'react-animate-height';
import { useOutletContext } from 'react-router';
import {
  mdiCheckboxBlankCircleOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiChevronDown,
  mdiEyeCheckOutline,
  mdiEyeOffOutline,
  mdiLoading,
} from '@mdi/js';
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

import type { SeriesContextType } from '@/components/Collection/constants';
import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  anidbSeriesId?: number;
  episode: EpisodeType;
  nextUp?: boolean;
  page?: number;
  selected?: boolean;
  seriesId: number;
  onSelectionChange?: () => void;
};

const StateIcon = ({ className, icon, show }: { icon: string, show: boolean, className?: string }) => (
  show ? <Icon path={icon} className={className} size={1.2} /> : null
);

const StateButton = React.memo((
  { active, disabled, icon, onClick, tooltip }: {
    icon: string;
    active: boolean;
    onClick: () => void;
    tooltip: string;
    disabled: boolean;
  },
) => (
  <Button
    className={cx('self-center', active ? 'text-panel-text-important' : 'text-panel-text')}
    onClick={onClick}
    tooltip={tooltip}
    disabled={disabled}
  >
    <Icon path={icon} size={1.2} />
  </Button>
));

const SelectedStateButton = React.memo((
  { onClick, selected, shadow, show }: { selected?: boolean, show?: boolean, shadow?: boolean, onClick?: () => void },
) => (
  show
    ? (
      <div
        className={cx(
          'flex flex-col items-center gap-y-6 rounded-br-lg rounded-tl-lg p-4',
          shadow && 'shadow-md',
        )}
      >
        <Button
          onClick={onClick ?? (() => {})}
          className="text-panel-text"
          tooltip={selected ? 'Unselect' : 'Select'}
        >
          <Icon
            path={selected ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline}
            className="text-panel-icon-action"
            size={1.2}
          />
        </Button>
      </div>
    )
    : null
));

const EpisodeSummary = React.memo(
  ({ anidbSeriesId, episode, nextUp, onSelectionChange, page, selected, seriesId }: Props) => {
    const { backdrop } = useOutletContext<SeriesContextType>();
    const thumbnail = useEpisodeThumbnail(episode, backdrop);
    const [open, toggleOpen] = useToggle(false);
    const episodeId = get(episode, 'IDs.ID', 0);

    const episodeFilesQuery = useEpisodeFilesQuery(
      episodeId,
      { includeDataFrom: ['AniDB'], include: ['AbsolutePaths', 'MediaInfo'] },
      open,
    );
    const { isPending: markWatchedPending, mutate: markWatched } = useWatchEpisodeMutation(seriesId, page, nextUp);
    const { isPending: markHiddenPending, mutate: markHidden } = useHideEpisodeMutation(seriesId, nextUp);

    const handleMarkWatched = useEventCallback(
      () => markWatched({ episodeId, watched: markWatchedPending ? !episode.Watched : episode.Watched === null }),
    );
    const handleMarkHidden = useEventCallback(
      () => markHidden({ episodeId, hidden: markHiddenPending ? episode.IsHidden : !episode.IsHidden }),
    );

    return (
      <>
        <div className={cx('z-10 flex items-center gap-x-6', !nextUp && 'p-6')}>
          <BackgroundImagePlaceholderDiv
            image={thumbnail}
            className="group flex h-[16.25rem] min-w-[28.75rem] rounded-lg border border-panel-border"
            zoomOnHover
          >
            <div className="absolute flex w-full flex-row justify-between rounded-lg transition-opacity group-hover:opacity-0">
              <div className="flex w-14 flex-col">
                <div className="rounded-br-lg bg-panel-background-transparent">
                  <SelectedStateButton selected={selected} show={selected} shadow onClick={onSelectionChange} />
                </div>
              </div>
              <div className="flex w-14 flex-col">
                {(!!episode.Watched || episode.IsHidden) && (
                  <div className="flex flex-col items-center gap-y-6 rounded-bl-lg rounded-tr-lg bg-panel-background-overlay p-4 text-panel-text-important shadow-md">
                    <StateIcon icon={mdiEyeCheckOutline} show={!!episode.Watched} />
                    <StateIcon icon={mdiEyeOffOutline} show={episode.IsHidden} />
                  </div>
                )}
              </div>
            </div>
            <div className="absolute z-10 flex size-full flex-row justify-between rounded-lg bg-panel-background-poster-overlay opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex w-14 flex-col">
                <SelectedStateButton
                  selected={selected}
                  show={typeof selected !== 'undefined'}
                  onClick={onSelectionChange}
                />
              </div>
              <div className="flex w-14 flex-col">
                <div className="flex flex-col gap-y-6 p-4 text-panel-text-important">
                  {episode.Size > 0 && (
                    <StateButton
                      icon={mdiEyeCheckOutline}
                      active={!!episode.Watched}
                      onClick={handleMarkWatched}
                      tooltip={`Mark ${episode.Watched ? 'Unwatched' : 'Watched'}`}
                      disabled={markWatchedPending}
                    />
                  )}
                  <StateButton
                    icon={mdiEyeOffOutline}
                    active={episode.IsHidden}
                    onClick={handleMarkHidden}
                    tooltip={`${episode.IsHidden ? 'Unhide' : 'Hide'} Episode`}
                    disabled={markHiddenPending}
                  />
                </div>
              </div>
            </div>
          </BackgroundImagePlaceholderDiv>
          <EpisodeDetails episode={episode} />
        </div>
        {anidbSeriesId && episode.Size > 0 && (
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
              <EpisodeFiles
                anidbSeriesId={anidbSeriesId}
                episodeFiles={episodeFilesQuery.data ?? []}
                episodeId={episodeId}
                seriesId={seriesId}
              />
            </AnimateHeight>
          </>
        )}
      </>
    );
  },
);

export default EpisodeSummary;
