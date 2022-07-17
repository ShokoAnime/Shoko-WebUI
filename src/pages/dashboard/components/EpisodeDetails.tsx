import moment from 'moment';
import React, { useMemo } from 'react';

import { DashboardEpisodeDetailsType } from '../../../core/types/api/dashboard';

const CalendarConfig: moment.CalendarSpec = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Today]', // hack for time zone miss-alignment.
  lastWeek: '[Last] dddd',
  sameElse: 'dddd',
};

function EpisodeDetails(props: { episode: DashboardEpisodeDetailsType; showDate?: boolean }): JSX.Element {
  const { episode, showDate = false } = props;
  const percentage = useMemo(() => {
    if (episode.ResumePosition == null)
      return null;
    const duration = moment.duration(episode.Duration);
    const resumePosition = moment.duration(episode.ResumePosition);
    return (resumePosition.asMilliseconds() / duration.asMilliseconds() * 100).toFixed(2) + '%';
  }, [episode.Duration, episode.ResumePosition]);
  const airDate = useMemo(() => moment(episode.AirDate), [episode.AirDate]);
  const relativeTime = useMemo(() => airDate.calendar(CalendarConfig), [airDate]);

  return (
  <div key={`episode-${episode.IDs.ID}`} className="mr-5 last:mr-0 shrink-0 w-56 font-open-sans justify-center flex flex-col">
    {showDate ? (<>
      <p className="truncate text-center text-base font-semibold">{airDate.format('MMMM Do, YYYY')}</p>
      <p className="truncate text-center text-sm mb-2">{relativeTime}</p>
    </>) : null}
    <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${episode.SeriesPoster.Source}/Poster/${episode.SeriesPoster.ID}')` }} className="relative h-80 rounded overflow-hidden drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black mb-2">
        {percentage ? (
          <div className="absolute bottom-0 left-0 h-1 bg-highlight-1" style={{ width: percentage }}></div>
        ) : null}
    </div>
    <p className="truncate text-center text-base font-semibold" title={episode.SeriesTitle}>{episode.SeriesTitle}</p>
    <p className="truncate text-center text-sm" title={`${episode.Number} - ${episode.Title}`}>{episode.Number} - {episode.Title}</p>
  </div>
  );
}

export default EpisodeDetails;