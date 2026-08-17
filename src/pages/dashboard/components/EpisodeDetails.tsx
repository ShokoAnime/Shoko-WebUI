import DashboardEpisode from '@/components/Dashboard/DashboardEpisode';
import SeriesPoster from '@/components/SeriesPoster';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { convertTimeSpanToMs, dayjs } from '@/core/util';

import type { DashboardEpisodeDetailsType } from '@/core/types/api/dashboard';
import type { EpisodeTypeValues } from '@/core/types/api/episode';

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

const anidbEpisodePrefixes = (type: EpisodeTypeValues, epNumber: number): string => {
  const fullPrefixes = (prefix: string) => `${prefix}${epNumber}`;
  // Prefixes for episode types base on https://wiki.anidb.net/Content:Episodes#Type
  switch (type) {
    case 'Credits':
      return fullPrefixes('C');
    case 'Special':
      return fullPrefixes('S');
    case 'Trailer':
      return fullPrefixes('T');
    case 'Other':
      return fullPrefixes('O');
    case 'Parody':
      return fullPrefixes('P');
    default:
      return fullPrefixes('');
  }
};

const EpisodeDetails = ({ episode, isInCollection = false, showDate = false }: Props) => {
  const settings = useSettingsQuery().data;

  const { useThumbnailsForEpisodes } = settings.WebUI_Settings.dashboard;

  let percentage: string | null = null;
  if (episode.ResumePosition != null) {
    const duration = dayjs.duration(convertTimeSpanToMs(episode.Duration));
    const resumePosition = dayjs.duration(convertTimeSpanToMs(episode.ResumePosition));
    percentage = `${((resumePosition.asMilliseconds() / duration.asMilliseconds()) * 100).toFixed(2)}%`;
  }
  const airDate = dayjs(episode.AirDate);
  const relativeTime = airDate.calendar(null, CalendarConfig);
  const title = `${anidbEpisodePrefixes(episode.Type, episode.Number)} - ${episode.Title}`;

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
        anidbSeriesId={episode.IDs.Series}
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
