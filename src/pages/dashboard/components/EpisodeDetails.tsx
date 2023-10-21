import React, { useMemo } from 'react';
import type { JSX } from 'react';
import { mdiLayersTripleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import moment from 'moment';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { DashboardEpisodeDetailsType } from '@/core/types/api/dashboard';

const CalendarConfig: moment.CalendarSpec = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Today]', // hack for time zone miss-alignment.
  lastWeek: '[Last] dddd',
  sameElse: 'dddd',
};

type Props = {
  episode: DashboardEpisodeDetailsType;
  showDate?: boolean;
  isInCollection?: boolean;
};

function EpisodeDetails(props: Props): JSX.Element {
  const { episode, isInCollection, showDate } = props;
  const percentage = useMemo(() => {
    if (episode.ResumePosition == null) return null;
    const duration = moment.duration(episode.Duration);
    const resumePosition = moment.duration(episode.ResumePosition);
    return `${((resumePosition.asMilliseconds() / duration.asMilliseconds()) * 100).toFixed(2)}%`;
  }, [episode.Duration, episode.ResumePosition]);
  const airDate = useMemo(() => moment(episode.AirDate), [episode.AirDate]);
  const relativeTime = useMemo(() => airDate.calendar(CalendarConfig), [airDate]);
  const title = useMemo(
    () => `${episode.Type === EpisodeTypeEnum.Normal ? '' : episode.Type[0]}${episode.Number} - ${episode.Title}`,
    [episode.Type, episode.Title, episode.Number],
  );

  return (
    <div key={`episode-${episode.IDs.ID}`} className="mr-4 flex w-56 shrink-0 flex-col justify-center last:mr-0">
      {showDate
        ? (
          <>
            <p className="truncate text-center text-sm font-semibold">{airDate.format('MMMM Do, YYYY')}</p>
            <p className="mb-2 truncate text-center text-sm opacity-75">{relativeTime}</p>
          </>
        )
        : null}
      <BackgroundImagePlaceholderDiv
        image={episode.SeriesPoster}
        className="mb-3 h-80 rounded border border-panel-border drop-shadow-md"
      >
        {percentage && (
          <div className="absolute bottom-0 left-0 h-1 bg-panel-text-primary" style={{ width: percentage }} />
        )}
        {isInCollection && (
          <div className="absolute right-3 top-3 rounded bg-panel-background-transparent p-1">
            <Icon path={mdiLayersTripleOutline} size={0.75} title="Episode is Already in Collection!" />
          </div>
        )}
      </BackgroundImagePlaceholderDiv>
      <p className="mb-1 truncate text-center text-sm font-semibold" title={episode.SeriesTitle}>
        {episode.SeriesTitle}
      </p>
      <p className="truncate text-center text-sm opacity-75" title={title}>{title}</p>
    </div>
  );
}

export default EpisodeDetails;
