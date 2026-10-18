import { LocalFilesIcon, UnresolvedHint } from '@/components/Calendar/AiringEntryParts';
import { dayjs } from '@/core/util';
import {
  formatCountdown,
  formatDayCountdown,
  formatDaysSince,
  formatTimeSince,
  getAiringDisplayTime,
  getAiringEpisodeNumber,
  getEntrySource,
  getSeasonAnimeLabel,
  hasAiringEnded,
  isAiringNow,
} from '@/core/utilities/airingSchedule';

import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { SeasonAnimeType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

const EpisodeLine = ({ airing, text }: { airing: EpisodeAiringType, text: string }) => (
  <span className="flex min-w-0 items-baseline gap-x-1.5 text-sm">
    <span className="truncate opacity-65">{text}</span>
    <UnresolvedHint airing={airing} />
  </span>
);

const NextAiringSlot = ({ airing }: { airing: EpisodeAiringType }) => {
  const time = getAiringDisplayTime(airing);
  const slot = airing.IsDateOnly ? time.format('ddd, MMM D') : `${time.format('dddd')}s ${time.format('HH:mm')}`;
  return (
    <span className="truncate text-sm opacity-65">{[slot, getEntrySource(airing)].filter(Boolean).join(' · ')}</span>
  );
};

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

  // A date-only episode has aired once its day is over.
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

const SeasonCardAiring = ({ anime, now }: { anime: SeasonAnimeType, now: Dayjs }) => {
  const { NextAiring: airing } = anime;
  if (!airing) return <span className="text-lg font-semibold">{getSeasonAnimeLabel(anime, now)}</span>;

  // An unresolved airing is a regular episode numbered by its place, so it reads the same.
  const number = getAiringEpisodeNumber(airing);
  const episode = number === null ? 'Next episode' : `Ep ${number}`;
  return (
    <div className="flex min-w-0 flex-col">
      <NextAiringTime airing={airing} episode={episode} now={now} />
      <div className="flex min-w-0 items-center gap-x-2">
        <NextAiringSlot airing={airing} />
        <LocalFilesIcon count={airing.VideoCount} />
      </div>
    </div>
  );
};

export default SeasonCardAiring;
