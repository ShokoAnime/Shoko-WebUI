import cx from 'classnames';

import AiringProviderIcon from '@/components/AiringProviderIcon';
import SeriesPoster from '@/components/SeriesPoster';
import { OtherAiringsPopover } from '@/components/Utilities/AiringSchedule/AiringEntry';
import {
  UNRESOLVED_AIRING_HINT,
  getAiringAnidbAnimeId,
  getAiringEpisodeLabel,
  getAiringShokoSeriesId,
} from '@/core/utilities/airingSchedule';
import useAiringProviderContext from '@/hooks/useAiringProviderContext';

import type { CalendarEntryType } from '@/core/utilities/airingSchedule';

type Props = {
  /** The episode's lead airing that day, with its other airings, listed from the count in the header. */
  entry: CalendarEntryType;
  isInCollection?: boolean;
  showTime?: boolean;
  /** Already aired, so shown muted. */
  isAired?: boolean;
};

const CalendarConfig = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'dddd',
};

/** An upcoming airing on the dashboard, laid out like the episodes of the other dashboard widgets. */
const AiringDetails = ({ entry, isAired = false, isInCollection = false, showTime = false }: Props) => {
  const { airing, time: airedAt } = entry;
  const relativeTime = airedAt.calendar(null, CalendarConfig);
  const seriesTitle = airing.Series?.Title ?? 'Unknown Series';
  const provider = useAiringProviderContext(airing.Source?.ID);
  const episodeLabel = getAiringEpisodeLabel(airing);

  return (
    <div className={cx('flex w-56 shrink-0 flex-col gap-y-3 transition-opacity', isAired && 'opacity-65')}>
      <div>
        <div className="truncate text-center text-sm font-semibold">{airedAt.format('MMMM Do, YYYY')}</div>
        <div className="flex min-w-0 items-center justify-center gap-x-1.5 text-sm font-semibold opacity-65">
          <span className="shrink-0">
            {showTime && !airing.IsDateOnly ? `${relativeTime}, ${airedAt.format('HH:mm')}` : relativeTime}
          </span>
          {/* The channel and the provider, in the header so the card keeps the widget's height. */}
          {airing.Channel && <span className="truncate">{`· ${airing.Channel.Name}`}</span>}
          {airing.Source && (
            <AiringProviderIcon
              providerId={airing.Source.ID}
              hasIcon={provider?.HasIcon ?? false}
              label={airing.Source.Name}
              size={0.6667}
            />
          )}
          <OtherAiringsPopover others={entry.others} />
        </div>
      </div>

      <SeriesPoster
        image={airing.Poster ?? undefined}
        title={seriesTitle}
        subtitle={airing.IsResolved ? episodeLabel : [episodeLabel, UNRESOLVED_AIRING_HINT].filter(Boolean).join(' · ')}
        shokoId={getAiringShokoSeriesId(airing)}
        anidbSeriesId={getAiringAnidbAnimeId(airing) ?? undefined}
        // An unresolved airing has no episode yet, so it links to its series.
        anidbEpisodeId={airing.IsResolved ? airing.IDs.AnidbEpisode ?? undefined : undefined}
        inCollection={isInCollection}
      />
    </div>
  );
};

export default AiringDetails;
