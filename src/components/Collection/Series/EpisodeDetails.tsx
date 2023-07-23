import { toNumber } from 'lodash';
import React from 'react';
import moment from 'moment/moment';
import { Icon } from '@mdi/react';
import { mdiCalendarMonthOutline, mdiClockOutline, mdiStarHalfFull } from '@mdi/js';

import { EpisodeType } from '@/core/types/api/episode';

const getDuration = (duration) => {
  const minutes = moment.duration(duration).asMinutes();
  const intMinutes = Math.round(toNumber(minutes));
  return `${intMinutes} minutes`;
};

function EpisodeDetails({ episode }: { episode: EpisodeType }) {
  return (
    <div className="flex flex-col gap-y-4 grow">
      <div className="flex justify-between font-semibold">
        <div className="opacity-65">Episode {episode.AniDB?.EpisodeNumber}</div>
        { episode.Size > 1 && (
          <div><span className="text-panel-important">{episode.Size}</span> Files</div>
        )}
      </div>

      <div className="-mt-4 text-xl font-semibold">
        {episode.Name}
      </div>

      <div className="flex gap-x-2 font-semibold text-sm items-center">
        <Icon path={mdiCalendarMonthOutline} size={1} />
        {moment(episode.AniDB?.AirDate).format('MMMM Do, YYYY')}
        <Icon path={mdiClockOutline} size={1} />
        {getDuration(episode.Duration)}
        <Icon path={mdiStarHalfFull} size={1} />
        {toNumber(episode.AniDB?.Rating.Value).toFixed(2)} ({episode.AniDB?.Rating.Votes} Votes)
      </div>

      <div className="flex line-clamp-3">
        {episode.AniDB?.Description}
      </div>
    </div>
  );
}

export default EpisodeDetails;
