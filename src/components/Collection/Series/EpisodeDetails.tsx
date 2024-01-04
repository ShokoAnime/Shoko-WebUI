import React from 'react';
import { mdiCalendarMonthOutline, mdiClockOutline, mdiStarHalfFull } from '@mdi/js';
import { Icon } from '@mdi/react';
import { toNumber } from 'lodash';

import { convertTimeSpanToMs, dayjs } from '@/core/util';

import type { EpisodeType } from '@/core/types/api/episode';

const getDuration = (duration: string) => {
  const minutes = dayjs.duration(convertTimeSpanToMs(duration)).asMinutes();
  const intMinutes = Math.round(toNumber(minutes));
  return `${intMinutes} minutes`;
};

function EpisodeDetails({ episode }: { episode: EpisodeType }) {
  return (
    <div className="flex grow flex-col gap-y-4">
      <div className="flex justify-between font-semibold">
        <div className="opacity-65">
          {episode.AniDB?.Type.replace('Normal', 'Episode').replace('ThemeSong', 'Credit') ?? 'Episode'}
          &nbsp;
          {episode.AniDB?.EpisodeNumber}
        </div>
        {episode.Size > 1 && (
          <div>
            <span className="text-panel-text-important">{episode.Size}</span>
            &nbsp;
            {episode.Size === 1 ? 'File' : 'Files'}
          </div>
        )}
      </div>

      <div className="-mt-4 text-xl font-semibold">
        {episode.Name}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 text-sm font-semibold">
        <div className="flex flex-wrap gap-x-2">
          <Icon className="text-panel-icon" path={mdiCalendarMonthOutline} size={1} />
          {dayjs(episode.AniDB?.AirDate).format('MMMM Do, YYYY')}
        </div>
        <div className="flex flex-wrap gap-x-2">
          <Icon className="text-panel-icon" path={mdiClockOutline} size={1} />
          {getDuration(episode.Duration)}
        </div>
        <div className="flex flex-wrap gap-x-2">
          <Icon className="text-panel-icon" path={mdiStarHalfFull} size={1} />
          {toNumber(episode.AniDB?.Rating.Value).toFixed(2)}
          &nbsp;(
          {episode.AniDB?.Rating.Votes}
          &nbsp;Votes)
        </div>
      </div>

      <div className="line-clamp-3">
        {episode.AniDB?.Description !== '' ? episode.AniDB?.Description : 'Episode description not available.'}
      </div>
    </div>
  );
}

export default EpisodeDetails;
