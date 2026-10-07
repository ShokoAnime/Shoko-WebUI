import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { startCase } from 'lodash';

import AiringProviderIcon from '@/components/AiringProviderIcon';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { Badge } from '@/components/Badge';
import CleanDescription from '@/components/Collection/CleanDescription';
import {
  LocalFilesIcon,
  MoreButton,
  OtherAiringsList,
  UnresolvedHint,
} from '@/components/Utilities/AiringSchedule/AiringEntry';
import { useSelector } from '@/core/store';
import { dayjs, getAnidbAnimeLink } from '@/core/util';
import {
  formatCountdown,
  formatDayCountdown,
  formatDaysSince,
  formatTimeSince,
  getAiringDisplayTime,
  getAiringVideoCount,
  hasAiringEnded,
  isAiringNow,
  parseTimeSpanMinutes,
  toCalendarEntry,
} from '@/core/utilities/airingSchedule';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';
import useAiringProviderContext from '@/hooks/useAiringProviderContext';
import useNow from '@/hooks/useNow';

import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { SeasonAnimeType } from '@/core/types/api/airing-season';
import type { Dayjs } from 'dayjs';

type Props = {
  /** The anime, with its next new episode's airing and the same episode's other airings. */
  anime: SeasonAnimeType;
  /** Show "In Collection"; "Missing Files" shows either way. */
  showCollectionBadge?: boolean;
};

/** A date the server may send partial (`2026` or `2026-10`), shown to the precision it has. */
const formatPartialDate = (value: string) => {
  if (value.length === 4) return value;
  return dayjs(value).format(value.length === 7 ? 'MMM YYYY' : 'MMM D, YYYY');
};

const SeriesLink = (
  { anime, children, className }: { anime: SeasonAnimeType, children: ReactNode, className: string },
) => {
  if (anime.ShokoID) {
    return <Link to={`/webui/collection/series/${anime.ShokoID}`} className={className}>{children}</Link>;
  }
  return (
    <a href={getAnidbAnimeLink(anime.ID)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
};

const CollectionBadge = ({ anime, showCollectionBadge }: { anime: SeasonAnimeType, showCollectionBadge: boolean }) => {
  if (!anime.ShokoID) return null;
  if (anime.VideoCount > 0) {
    if (!showCollectionBadge) return null;
    return (
      <Badge className="shrink-0 self-start bg-panel-text-important text-button-primary-text">In Collection</Badge>
    );
  }
  return <Badge className="shrink-0 self-start bg-panel-text-warning text-button-primary-text">Missing Files</Badge>;
};

/** The next airing's regular slot, eg. `Saturdays 01:30 · Tokyo MX`, from its time here and its channel. */
const NextAiringSlot = ({ airing }: { airing: EpisodeAiringType }) => {
  const provider = useAiringProviderContext(airing.Source?.ID);
  const time = getAiringDisplayTime(airing);
  // A date-only episode has its day and nothing more.
  if (airing.IsDateOnly) {
    return <span className="truncate text-sm opacity-65">{`${time.format('ddd, MMM D')} · AniDB Air Date`}</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-x-1.5 text-sm">
      <span className="truncate opacity-65">
        {[`${time.format('dddd')}s ${time.format('HH:mm')}`, airing.Channel?.Name].filter(Boolean).join(' · ')}
      </span>
      {airing.Source && (
        <span className="flex shrink-0 opacity-65">
          <AiringProviderIcon
            providerId={airing.Source.ID}
            hasIcon={provider?.HasIcon ?? false}
            label={airing.Source.Name}
            size={0.6667}
          />
        </span>
      )}
    </span>
  );
};

/** The muted line above the countdown, naming the episode, and that AniDB does not list it yet when it is unresolved. */
const EpisodeLine = ({ airing, text }: { airing: EpisodeAiringType, text: string }) => (
  <span className="flex min-w-0 items-baseline gap-x-1.5 text-sm">
    <span className="truncate opacity-65">{text}</span>
    <UnresolvedHint airing={airing} />
  </span>
);

/**
 * The countdown to the next airing, or while it is on air that it is and when it ends, all by the clock. Once over it
 * says how long ago it aired, in green like the airing now, until the season's next read moves on to the following episode.
 */
const NextAiringTime = ({ airing, episode, now }: { airing: EpisodeAiringType, episode: string, now: Dayjs }) => {
  const time = getAiringDisplayTime(airing);
  const tooltip = time.format(airing.IsDateOnly ? 'dddd, MMMM D' : 'dddd, MMMM D, HH:mm');

  if (isAiringNow(airing, now)) {
    const endsAt = dayjs(airing.EndsAt);
    const endsIn = formatCountdown(endsAt, now);
    return (
      <>
        <EpisodeLine airing={airing} text={episode} />
        <span
          className="flex min-w-0 items-baseline gap-x-2"
          data-tooltip-id="tooltip"
          data-tooltip-content={`${tooltip} - ${endsAt.format('HH:mm')}`}
        >
          <span className="shrink-0 text-lg font-semibold text-panel-text-important">Airing now</span>
          <span className="truncate text-sm opacity-65">{endsIn === 'now' ? 'ending now' : `ends in ${endsIn}`}</span>
        </span>
      </>
    );
  }

  // A date-only episode has aired once its day is over, which the recently aired look back may keep.
  const hasAired = airing.IsDateOnly ? time.isBefore(now, 'day') : hasAiringEnded(airing, now);
  if (hasAired) {
    return (
      <>
        <EpisodeLine airing={airing} text={`${episode} aired`} />
        <span
          className="text-lg font-semibold text-panel-text-important"
          data-tooltip-id="tooltip"
          data-tooltip-content={tooltip}
        >
          {airing.IsDateOnly ? formatDaysSince(time, now) : formatTimeSince(time, now)}
        </span>
      </>
    );
  }

  const countdown = airing.IsDateOnly ? formatDayCountdown(time, now) : formatCountdown(time, now);
  const isNear = countdown === 'Today' || countdown === 'Tomorrow';
  return (
    <>
      <EpisodeLine airing={airing} text={isNear ? `${episode} airs` : `${episode} airing in`} />
      <span
        className="text-lg font-semibold text-panel-text-primary"
        data-tooltip-id="tooltip"
        data-tooltip-content={tooltip}
      >
        {countdown}
      </span>
    </>
  );
};

/** When the anime airs: the next episode with the countdown to it and its slot, else when it started or ended. */
const AiringStatus = ({ anime }: Props) => {
  const now = useNow();
  const [expanded, setExpanded] = useState(false);
  // The other airings only show with the airing schedule's Every Channel on.
  const everyChannel = useSelector(state => state.utilities.airingSchedule.everyChannel);
  const { NextAiring: nextAiring } = anime;
  const others = everyChannel ? anime.OtherAirings : [];

  if (nextAiring) {
    // An unresolved airing is a regular episode numbered by its place, so it reads the same.
    const episode = nextAiring.Number === null
      ? 'Next episode'
      : `Ep ${getEpisodePrefix(nextAiring.Type ?? undefined)}${nextAiring.Number}`;
    return (
      <div className="flex min-w-0 flex-col">
        <NextAiringTime airing={nextAiring} episode={episode} now={now} />
        <div className="flex min-w-0 items-center gap-x-2">
          <NextAiringSlot airing={nextAiring} />
          <LocalFilesIcon count={getAiringVideoCount(nextAiring)} />
          <MoreButton
            entry={{ ...toCalendarEntry(nextAiring), others: others.map(toCalendarEntry) }}
            expanded={expanded}
            onToggle={() => setExpanded(value => !value)}
            showDay
          />
        </div>
        {/* The card keeps its height, so a long list scrolls. */}
        {expanded && others.length > 0 && (
          <OtherAiringsList
            others={others.map(toCalendarEntry)}
            className="mt-1 max-h-24 overflow-y-auto border-t border-panel-border pt-1 text-xs"
            showDay
          />
        )}
      </div>
    );
  }

  const { AirDate: airDate, EndDate: endDate } = anime;
  let label = 'Air date unknown';
  if (anime.AiringStatus === 'Finished') label = endDate ? `Finished ${formatPartialDate(endDate)}` : 'Finished';
  else if (endDate && dayjs(endDate).isBefore(now)) label = `Finished ${formatPartialDate(endDate)}`;
  else if (airDate && dayjs(airDate).isAfter(now)) label = `Starts ${formatPartialDate(airDate)}`;
  else if (airDate) label = `Airing since ${formatPartialDate(airDate)}`;
  return <span className="text-lg font-semibold">{label}</span>;
};

/** One anime of the season, laid out like a season chart card: the poster, then when it airs and what it is. */
const SeasonCard = ({ anime, showCollectionBadge = true }: Props) => {
  const studios = anime.Studios.map(studio => studio.Name).join(', ');
  const source = anime.SourceMaterial && anime.SourceMaterial !== 'Unknown' ? startCase(anime.SourceMaterial) : null;
  // The next episode's own length, else the anime's usual one.
  const minutes = parseTimeSpanMinutes(anime.NextAiring?.Duration ?? null)
    ?? parseTimeSpanMinutes(anime.EpisodeDuration);
  const details = [
    source && `Source · ${source}`,
    anime.EpisodeCount ? `${anime.EpisodeCount} ${anime.EpisodeCount === 1 ? 'Episode' : 'Episodes'}` : null,
    minutes ? `${minutes} ${minutes === 1 ? 'min' : 'mins'}` : null,
  ].filter(Boolean).join(' | ');

  return (
    // A narrow card, as on a phone, has a narrower poster to leave the rest room.
    <div className="@container flex h-64 overflow-hidden rounded-lg border border-panel-border bg-panel-background-alt">
      <SeriesLink anime={anime} className="group relative isolate w-28 shrink-0 @sm:w-44">
        {/* A missing poster leaves the frame empty, so the notice does not cover the title. */}
        {anime.Poster?.Available
          ? <BackgroundImagePlaceholderDiv image={anime.Poster} className="size-full" zoomOnHover />
          : <div className="size-full bg-panel-input" />}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-y-1 bg-panel-background-overlay p-3">
          <span
            className="line-clamp-2 text-sm font-semibold"
            data-tooltip-id="tooltip"
            data-tooltip-content={anime.Title}
            data-tooltip-delay-show={500}
          >
            {anime.Title}
          </span>
          {studios && <span className="truncate text-xs text-panel-text-primary">{studios}</span>}
        </div>
      </SeriesLink>

      <div className="flex min-w-0 grow flex-col gap-y-2 p-3 @sm:p-4">
        {/* A narrow card puts the badge above, leaving the airing the whole width. */}
        <div className="flex flex-col-reverse gap-1 @sm:flex-row @sm:items-start @sm:justify-between">
          <AiringStatus anime={anime} />
          <CollectionBadge anime={anime} showCollectionBadge={showCollectionBadge} />
        </div>
        {details && <span className="text-sm opacity-65">{details}</span>}
        <CleanDescription
          className="line-clamp-3 pr-0! text-sm! opacity-85 @sm:line-clamp-4"
          text={anime.Overview ?? ''}
        />
        {anime.Tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1">
            {anime.Tags.map(tag => (
              <Badge key={`${tag.Source}-${tag.ID}`} className="bg-panel-tags capitalize">{tag.Name}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonCard;
