import React from 'react';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { padNumber } from '@/core/util';
import { getEpisodePrefixAlt } from '@/core/utilities/getEpisodePrefix';

import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  episode: EpisodeType;
  extra?: boolean;
  isOdd: boolean;
  onIconClick?: () => void;
};

const AniDBEpisode = React.memo(({ episode, extra, isOdd, onIconClick }: Props) => (
  <div
    className={cx(
      'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
      isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
    )}
  >
    {!extra && (
      <>
        <div className="w-8">
          {getEpisodePrefixAlt(episode.AniDB?.Type)}
        </div>
        <div className="w-8">{padNumber(episode.AniDB?.EpisodeNumber ?? 0)}</div>
        <div className="line-clamp-1 grow text-left">{episode.Name}</div>
        {onIconClick && (
          <Button onClick={onIconClick} tooltip="Add link">
            <Icon path={mdiPlus} size={1} className="text-panel-icon-action" />
          </Button>
        )}
      </>
    )}

    {extra && (
      <>
        <div className="grow" />
        {onIconClick && (
          <Button onClick={onIconClick} tooltip="Remove link">
            <Icon path={mdiMinus} size={1} className="text-panel-icon-action" />
          </Button>
        )}
      </>
    )}
  </div>
));

export default AniDBEpisode;
