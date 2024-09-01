import React from 'react';
import cx from 'classnames';

import { padNumber } from '@/core/util';
import { getEpisodePrefixAlt } from '@/core/utilities/getEpisodePrefix';

import type { EpisodeType } from '@/core/types/api/episode';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
};

const AniDBEpisode = React.memo(({ episode, isOdd }: Props) => (
  <div
    className={cx(
      'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
      isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
    )}
  >
    <div className="w-8">
      {getEpisodePrefixAlt(episode.AniDB?.Type)}
    </div>
    <div className="w-8">{padNumber(episode.AniDB?.EpisodeNumber ?? 0)}</div>
    <div className="line-clamp-1">{episode.Name}</div>
  </div>
));

export default AniDBEpisode;
