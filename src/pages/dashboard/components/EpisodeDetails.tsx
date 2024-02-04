import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { convertTimeSpanToMs, dayjs } from '@/core/util';

import type { DashboardEpisodeDetailsType } from '@/core/types/api/dashboard';

type Props = {
  episode: DashboardEpisodeDetailsType;
  showDate?: boolean;
  isInCollection?: boolean;
};

const CalendarConfig = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Today]', // hack for time zone miss-alignment.
  lastWeek: '[Last] dddd',
  sameElse: 'dddd',
};

const DateSection: React.FC<{ airDate: dayjs.Dayjs, relativeTime: string }> = ({ airDate, relativeTime }) => (
  <>
    <p className="truncate text-center text-sm font-semibold">{airDate.format('MMMM Do, YYYY')}</p>
    <p className="mb-2 truncate text-center text-sm font-semibold opacity-65">{relativeTime}</p>
  </>
);

const ImageSection: React.FC<
  { episode: DashboardEpisodeDetailsType, percentage: string | null, isInCollection: boolean }
> = ({ episode, isInCollection, percentage }) => (
  <BackgroundImagePlaceholderDiv
    image={episode.SeriesPoster}
    className=" h-80 rounded-lg border border-panel-border drop-shadow-md"
    hidePlaceholderOnHover
    zoomOnHover
  >
    {percentage && <div className="absolute bottom-0 left-0 h-1 bg-panel-text-primary" style={{ width: percentage }} />}
    {isInCollection && (
      <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
        In Collection
      </div>
    )}
    <div className="pointer-events-none z-50 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
  </BackgroundImagePlaceholderDiv>
);

const TitleSection: React.FC<{ episode: DashboardEpisodeDetailsType, title: string }> = ({ episode, title }) => (
  <div>
    <p className="truncate text-center text-sm font-semibold" title={episode.SeriesTitle}>
      {episode.SeriesTitle}
    </p>
    <p className="truncate text-center text-sm font-semibold opacity-65" title={title}>{title}</p>
  </div>
);

const anidbEpisodePrefixes = (type: EpisodeTypeEnum, epNumber: number): string => {
  const fullPrefixes = (prefix: string) => `${prefix}${epNumber}`;
  // Prefixes for episode types base on https://wiki.anidb.net/Content:Episodes#Type
  switch (type) {
    case EpisodeTypeEnum.ThemeSong:
    case EpisodeTypeEnum.OpeningSong:
    case EpisodeTypeEnum.EndingSong:
      return fullPrefixes('C');
    case EpisodeTypeEnum.Special:
    case EpisodeTypeEnum.Extra:
      return fullPrefixes('S');
    case EpisodeTypeEnum.Trailer:
      return fullPrefixes('T');
    case EpisodeTypeEnum.Other:
      return fullPrefixes('O');
    case EpisodeTypeEnum.Parody:
      return fullPrefixes('P');
    default:
      return fullPrefixes('');
  }
};

function EpisodeDetails({ episode, isInCollection = false, showDate = false }: Props): React.ReactNode {
  const percentage = useMemo(() => {
    if (episode.ResumePosition == null) return null;
    const duration = dayjs.duration(convertTimeSpanToMs(episode.Duration));
    const resumePosition = dayjs.duration(convertTimeSpanToMs(episode.ResumePosition));
    return `${((resumePosition.asMilliseconds() / duration.asMilliseconds()) * 100).toFixed(2)}%`;
  }, [episode.Duration, episode.ResumePosition]);

  const airDate = useMemo(() => dayjs(episode.AirDate), [episode.AirDate]);
  const relativeTime = useMemo(() => airDate.calendar(null, CalendarConfig), [airDate]);
  const title = useMemo(
    () => `${anidbEpisodePrefixes(episode.Type, episode.Number)} - ${episode.Title}`,
    [episode.Type, episode.Title, episode.Number],
  );

  const content = (
    <>
      {showDate && <DateSection airDate={airDate} relativeTime={relativeTime} />}
      <ImageSection episode={episode} percentage={percentage} isInCollection={isInCollection} />
      <TitleSection episode={episode} title={title} />
    </>
  );

  return (
    <div
      key={`episode-${episode.IDs.ID}`}
      className={cx(
        'mr-4 flex w-56 shrink-0 flex-col justify-center  last:mr-0',
        episode.IDs.ShokoSeries && 'group',
      )}
    >
      {episode.IDs.ShokoSeries
        ? (
          <Link className="flex flex-col gap-y-3" to={`/webui/collection/series/${episode.IDs.ShokoSeries}`}>
            {content}
          </Link>
        )
        : content}
    </div>
  );
}

export default EpisodeDetails;
