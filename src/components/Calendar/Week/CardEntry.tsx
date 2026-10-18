import cx from 'classnames';

import {
  EntryBadges,
  EntryPoster,
  EntryTitle,
  LocalFilesIcon,
  NowBadge,
  UnresolvedHint,
} from '@/components/Calendar/AiringEntryParts';
import { formatEntryTime, getAiringEpisodeLabel, getEntrySource } from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';

type Props = {
  entry: CalendarEntryType;
  now: Dayjs;
};

const CardEntry = ({ entry, now }: Props) => {
  const { airing, movedTo } = entry;
  const episodeLabel = getAiringEpisodeLabel(airing);
  const source = getEntrySource(airing);

  return (
    <div
      className={cx(
        'flex gap-x-2 rounded-lg border border-panel-border bg-panel-background-alt p-2 text-sm',
        (movedTo !== null || airing.IsEstimated) && 'border-dashed',
      )}
    >
      <div className="hidden shrink-0 2xl:block">
        <EntryPoster airing={airing} className="h-20 w-14" />
      </div>
      <div className="flex min-w-0 grow flex-col gap-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex items-center gap-x-1.5">
            <span className={cx('font-semibold text-panel-text-important', movedTo && 'line-through')}>
              {formatEntryTime(entry)}
            </span>
            <NowBadge entry={entry} now={now} />
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            <EntryBadges entry={entry} />
          </div>
        </div>
        <EntryTitle airing={airing} />
        {(episodeLabel || airing.VideoCount > 0) && (
          <div className="flex min-w-0 items-center gap-x-1.5">
            {episodeLabel && (
              <span
                className="truncate opacity-65"
                data-tooltip-id="tooltip"
                data-tooltip-content={episodeLabel}
                data-tooltip-delay-show={500}
              >
                {episodeLabel}
              </span>
            )}
            <UnresolvedHint airing={airing} />
            <LocalFilesIcon count={airing.VideoCount} />
          </div>
        )}
        {source && <span className="truncate text-xs opacity-65">{source}</span>}
      </div>
    </div>
  );
};

export default CardEntry;
