import React, { useMemo } from 'react';

import DashboardEpisode from '@/components/Dashboard/DashboardEpisode';
import SeriesPoster from '@/components/SeriesPoster';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
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

const EpisodeDetails = ({ episode, isInCollection = false, showDate = false }: Props): React.ReactNode => {
  const settings = useSettingsQuery().data;

  const { useThumbnailsForEpisodes } = settings.WebUI_Settings.dashboard;

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

  // showDate is only true for Upcoming Anime panel
  // I didn't want to add another prop
  if (useThumbnailsForEpisodes && !showDate) {
    return (
      <DashboardEpisode
        key={`episode-${episode.IDs.ID}`}
        episodeId={episode.IDs.ID}
        shokoId={episode.IDs.ShokoSeries!}
        thumbnail={episode.Thumbnail}
        title={episode.SeriesTitle}
        subtitle={episode.Title}
      />
    );
  }

  return (
    <div
      key={`episode-${episode.IDs.ID}`}
      className="flex w-56 shrink-0 flex-col gap-y-3"
    >
      {showDate && (
        <div>
          <div className="truncate text-center text-sm font-semibold">{airDate.format('MMMM Do, YYYY')}</div>
          <div className="truncate text-center text-sm font-semibold opacity-65">{relativeTime}</div>
        </div>
      )}

      <SeriesPoster
        image={episode.SeriesPoster}
        title={episode.SeriesTitle}
        subtitle={title}
        shokoId={episode.IDs.ShokoSeries}
        anidbEpisodeId={episode.IDs.ID}
        inCollection={isInCollection}
      >
        {percentage && (
          <div className="absolute bottom-0 left-0 h-1 bg-panel-text-primary" style={{ width: percentage }} />
        )}
      </SeriesPoster>
    </div>
  );
};

export default EpisodeDetails;
