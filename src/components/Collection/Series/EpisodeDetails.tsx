import React from 'react';
import { mdiCalendarMonthOutline, mdiClockOutline, mdiStarHalfFull } from '@mdi/js';
import { Icon } from '@mdi/react';
import dayjs from 'dayjs';
import { toNumber } from 'lodash';

import { convertTimeSpanToMs } from '@/core/util';

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
          Episode&nbsp;
          {episode.AniDB?.EpisodeNumber}
        </div>
        {episode.Size > 1 && (
          <div>
            <span className="text-panel-text-important">{episode.Size}</span>
            &nbsp;Files
          </div>
        )}
      </div>

      <div className="-mt-4 text-xl font-semibold">
        {episode.Name}
      </div>

      <div className="flex items-center gap-x-2 text-sm font-semibold">
        <Icon className="text-panel-icon" path={mdiCalendarMonthOutline} size={1} />
        {dayjs(episode.AniDB?.AirDate).format('MMMM Do, YYYY')}
        <Icon className="text-panel-icon" path={mdiClockOutline} size={1} />
        {getDuration(episode.Duration)}
        <Icon className="text-panel-icon" path={mdiStarHalfFull} size={1} />
        {toNumber(episode.AniDB?.Rating.Value).toFixed(2)}
        &nbsp;(
        {episode.AniDB?.Rating.Votes}
        &nbsp;Votes)
      </div>

      <div className="line-clamp-3 flex">
        {episode.AniDB?.Description}
      </div>
    </div>
  );
}

export default EpisodeDetails;
