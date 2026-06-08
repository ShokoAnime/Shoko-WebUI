import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiChevronLeft, mdiChevronRight, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { flatMap, map } from 'lodash';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import DuplicatesInfo from './DuplicatesInfo';
import MultipleReleasesInfo from './MultipleReleasesInfo';

import type { ReleaseManagementItemType } from '@/core/react-query/release-management/types';
import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  episode?: EpisodeType;
  episodeCount: number;
  episodeIndex: number;
  handleEpisodeChange: (type: 'previous' | 'next') => void;
  isFetching: boolean;
  onClose: () => void;
  show: boolean;
  type: ReleaseManagementItemType;
};

type FooterProps = Pick<Props, 'episodeCount' | 'episodeIndex' | 'handleEpisodeChange' | 'onClose'>;

const Footer = ({ episodeCount, episodeIndex, handleEpisodeChange, onClose }: FooterProps) => (
  <div className="flex items-center justify-between">
    <div className="flex gap-x-2">
      <Button onClick={() => handleEpisodeChange('previous')} disabled={episodeIndex === 0}>
        <Icon path={mdiChevronLeft} size={1.5} className="text-panel-icon-action" />
      </Button>
      <div className="flex items-center">
        {episodeIndex + 1}
        &nbsp;/&nbsp;
        {episodeCount}
      </div>
      <Button onClick={() => handleEpisodeChange('next')} disabled={episodeIndex === episodeCount - 1}>
        <Icon path={mdiChevronRight} size={1.5} className="text-panel-icon-action" />
      </Button>
    </div>
    <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
      Close
    </Button>
  </div>
);

const EpisodeName = ({ episode }: { episode: EpisodeType }) => (
  <div className="line-clamp-1 text-sm opacity-65">
    {getEpisodePrefix(episode.AniDB?.Type)}
    {episode.AniDB?.EpisodeNumber}
    &nbsp;-&nbsp;
    {episode.Name}
  </div>
);

const ReleaseManagementModal = (props: Props) => {
  const { episode, episodeCount, episodeIndex, handleEpisodeChange, isFetching, onClose, show, type } = props;

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('enter, escape', onClose, { scopes: 'modal' });
  useHotkeys('left', () => handleEpisodeChange('previous'), { scopes: 'modal' });
  useHotkeys('right', () => handleEpisodeChange('next'), { scopes: 'modal' });

  if (!episode) return null;

  return (
    <ModalPanel
      show={show}
      size="xl"
      onRequestClose={onClose}
      header="Multiple Releases"
      subHeader={<EpisodeName episode={episode} />}
      footer={
        <Footer
          episodeCount={episodeCount}
          episodeIndex={episodeIndex}
          handleEpisodeChange={handleEpisodeChange}
          onClose={onClose}
        />
      }
      fullHeight
    >
      <div className="flex h-full flex-col gap-y-4 overflow-y-auto pr-2">
        {isFetching && (
          <div className="flex h-full items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!isFetching && type === 'MultipleReleases' && map(episode.Files, file => (
          <MultipleReleasesInfo
            key={file.ID}
            file={file}
          />
        ))}

        {!isFetching && type === 'DuplicateFiles' && flatMap(episode.Files, file =>
          map(file.Locations, location => (
            <DuplicatesInfo
              key={location.ID}
              file={file}
              location={location}
            />
          )))}
      </div>
    </ModalPanel>
  );
};

export default ReleaseManagementModal;
