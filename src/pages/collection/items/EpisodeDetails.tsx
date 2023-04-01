import { Icon } from '@mdi/react';
import { mdiCalendarMonthOutline, mdiClockTimeFourOutline, mdiEyeCheckOutline, mdiEyeOutline, mdiFilmstrip, mdiStarHalfFull } from '@mdi/js';
import { toNumber } from 'lodash';
import React from 'react';
import moment from 'moment/moment';

const getDuration = (duration) => {
  const minutes = moment.duration(duration)
    .asMinutes();
  const intMinutes = Math.round(toNumber(minutes));
  return `${intMinutes} minutes`;
};

export function EpisodeDetails(props: { episode: any }) {
  return <div className="flex flex-col space-y-4 grow">
    <div className="mt-2 flex justify-between">
      <span className="text-xl font-semibold text-font-main">{props.episode.Name}</span>
      <Icon className="text-highlight-1" path={props.episode.Watched === null ? mdiEyeOutline : mdiEyeCheckOutline} size={1}/>
    </div>
    <div className="mt-5 space-x-4 flex flex-nowrap">
      <div className="space-x-2 flex">
        <Icon path={mdiFilmstrip} size={1}/>
        <span>Episode {props.episode.AniDB?.EpisodeNumber}</span>
      </div>
      <div className="space-x-2 flex">
        <Icon path={mdiCalendarMonthOutline} size={1}/>
        <span>{props.episode.AniDB?.AirDate}</span>
      </div>
      <div className="space-x-2 flex">
        <Icon path={mdiClockTimeFourOutline} size={1}/>
        <span>{getDuration(props.episode.Duration)}</span>
      </div>
      <div className="space-x-2 flex">
        <Icon path={mdiStarHalfFull} size={1}/>
        <span>{toNumber(props.episode.AniDB?.Rating.Value)
          .toFixed(2)} ({props.episode.AniDB?.Rating.Votes} Votes)</span>
      </div>
    </div>
    <div className="line-clamp-3 text-font-main">
      {props.episode.AniDB?.Description}
    </div>
  </div>;
}