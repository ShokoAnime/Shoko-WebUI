import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
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
  onClose: () => void;
  seriesId: number;
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
  const { episode, episodeCount, episodeIndex, handleEpisodeChange, onClose, seriesId, show, type } = props;

  useToggleModalKeybinds(show);
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
      <div className="flex flex-col gap-y-4 overflow-y-auto pr-2">
        {type === 'MultipleReleases' && map(episode.Files, file => (
          <MultipleReleasesInfo
            episode={episode}
            file={file}
            handleEpisodeChange={handleEpisodeChange}
            seriesId={seriesId}
          />
        ))}

        {type === 'DuplicateFiles' && flatMap(episode.Files, file =>
          map(file.Locations, location => (
            <DuplicatesInfo
              file={file}
              handleEpisodeChange={handleEpisodeChange}
              location={location}
              seriesId={seriesId}
            />
          )))}
      </div>
    </ModalPanel>
  );
};

export default ReleaseManagementModal;
