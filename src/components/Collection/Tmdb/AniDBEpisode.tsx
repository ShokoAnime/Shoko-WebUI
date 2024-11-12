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
      'flex items-center grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
      isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
    )}
  >
    <div className={cx('w-8 shrink-0', extra && 'opacity-65')}>
      {getEpisodePrefixAlt(episode.AniDB?.Type)}
    </div>
    <div className={cx('w-8 shrink-0', extra && 'opacity-65')}>{padNumber(episode.AniDB?.EpisodeNumber ?? 0)}</div>

    <div
      className={cx('flex flex-col grow', extra && 'opacity-65')}
      data-tooltip-id="tooltip"
      data-tooltip-content={episode.Name}
    >
      <div className="line-clamp-1 text-xs font-semibold opacity-65">
        {episode.AniDB?.AirDate ?? 'Airdate Unknown'}
      </div>
      <div className="line-clamp-1">
        {episode.Name}
      </div>
    </div>

    {onIconClick && (
      <Button onClick={onIconClick} tooltip={extra ? 'Remove link' : 'Add link'}>
        <Icon path={extra ? mdiMinus : mdiPlus} size={1} className="text-panel-icon-action" />
      </Button>
    )}
  </div>
));

export default AniDBEpisode;
