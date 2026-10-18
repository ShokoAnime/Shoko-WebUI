import cx from 'classnames';

import {
  EntryBadges,
  EntryPoster,
  EntryTitle,
  LocalFilesIcon,
  NowBadge,
  UnresolvedHint,
} from '@/components/AiringSchedule/AiringEntryParts';
import SeriesLink from '@/components/AiringSchedule/SeriesLink';
import {
  UNRESOLVED_AIRING_HINT,
  formatEntryTime,
  formatLocalFiles,
  getAiringEpisodeLabel,
  getAiringSeriesIds,
  getEntryBadges,
  getEntrySource,
} from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { Dayjs } from '@/core/util';

type Props = {
  entry: CalendarEntryType;
  now: Dayjs;
};

export const CompactEntry = ({ entry, now }: Props) => {
  const { airing, isAllDay, movedTo } = entry;
  const episodeLabel = getAiringEpisodeLabel(airing);
  const tooltip = [
    airing.Series?.Title,
    episodeLabel,
    airing.IsResolved ? null : UNRESOLVED_AIRING_HINT,
    getEntrySource(airing),
    ...getEntryBadges(entry).map(badge => badge.tooltip),
    airing.VideoCount > 0 ? formatLocalFiles(airing.VideoCount) : null,
  ].filter(Boolean).join(' | ');

  return (
    <div
      className={cx('flex min-w-0 gap-x-1.5 text-sm', (movedTo !== null || airing.IsEstimated) && 'opacity-65')}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-delay-show={500}
    >
      {!isAllDay && (
        <span className={cx('shrink-0 text-panel-text-important', movedTo && 'line-through')}>
          {formatEntryTime(entry)}
        </span>
      )}
      <NowBadge entry={entry} now={now} className="self-center px-1 leading-4" showTooltip={false} />
      <LocalFilesIcon count={airing.VideoCount} showTooltip={false} />
      <SeriesLink {...getAiringSeriesIds(airing)} className="truncate">
        {airing.Series?.Title ?? 'Unknown Series'}
      </SeriesLink>
    </div>
  );
};

export const CardEntry = ({ entry, now }: Props) => {
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

export const RowEntry = ({ entry, isStriped, now }: Props & { isStriped: boolean }) => {
  const { airing, movedTo } = entry;
  const episodeLabel = getAiringEpisodeLabel(airing);

  return (
    <div className={cx('flex h-22 items-center gap-x-4 rounded-lg p-3', isStriped && 'bg-panel-background-alt')}>
      <span className={cx('w-12 shrink-0 font-semibold text-panel-text-important', movedTo && 'line-through')}>
        {!entry.isAllDay && formatEntryTime(entry)}
      </span>
      <EntryPoster airing={airing} className="h-16 w-11" />
      <div className="flex min-w-0 grow basis-0 flex-col">
        <EntryTitle airing={airing} />
        <div className="flex min-w-0 items-center gap-x-1.5 text-sm">
          {episodeLabel && <span className="truncate opacity-65">{episodeLabel}</span>}
          <UnresolvedHint airing={airing} />
          <LocalFilesIcon count={airing.VideoCount} />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <NowBadge entry={entry} now={now} />
        <EntryBadges entry={entry} />
      </div>
      <span className="w-40 shrink-0 truncate text-right text-sm opacity-65">{getEntrySource(airing)}</span>
    </div>
  );
};
