import { mdiFileDocumentMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import SeriesLink from '@/components/Calendar/SeriesLink';
import { dayjs } from '@/core/util';
import {
  UNRESOLVED_AIRING_HINT,
  formatLocalFiles,
  getAiringSeriesIds,
  getEntryBadges,
  isAiringNow,
} from '@/core/utilities/airingSchedule';

import type { CalendarEntryType } from '@/core/react-query/airing-schedule/types';
import type { EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { Dayjs } from '@/core/util';

export const EntryBadges = ({ entry }: { entry: CalendarEntryType }) => (
  <>
    {getEntryBadges(entry).map(badge => (
      <span
        key={badge.text}
        className={cx(
          'rounded-sm border px-1.5 text-xs',
          badge.warning ? 'border-panel-text-warning text-panel-text-warning' : 'border-panel-border opacity-80',
        )}
        data-tooltip-id="tooltip"
        data-tooltip-content={badge.tooltip}
      >
        {badge.text}
      </span>
    ))}
  </>
);

export const NowBadge = (
  { className, entry, now, showTooltip = true }: {
    className?: string;
    entry: CalendarEntryType;
    now: Dayjs;
    showTooltip?: boolean;
  },
) => {
  if (entry.movedTo || !isAiringNow(entry.airing, now)) return null;
  return (
    <span
      className={cx(
        'shrink-0 rounded-sm border border-panel-text-important text-xs text-panel-text-important',
        className ?? 'px-1.5',
      )}
      data-tooltip-id={showTooltip ? 'tooltip' : undefined}
      data-tooltip-content={`On air until ${dayjs(entry.airing.EndsAt).format('HH:mm')}`}
    >
      Now
    </span>
  );
};

export const LocalFilesIcon = ({ count, showTooltip = true }: { count: number, showTooltip?: boolean }) => {
  if (count <= 0) return null;
  return (
    <span
      className="flex shrink-0 items-center opacity-65"
      role="img"
      aria-label={formatLocalFiles(count)}
      data-tooltip-id={showTooltip ? 'tooltip' : undefined}
      data-tooltip-content={formatLocalFiles(count)}
    >
      <Icon path={mdiFileDocumentMultipleOutline} size={0.6667} />
    </span>
  );
};

export const UnresolvedHint = ({ airing }: { airing: EpisodeAiringType }) => {
  if (airing.IsResolved) return null;
  return (
    <span
      className="shrink-0 text-xs opacity-65"
      data-tooltip-id="tooltip"
      data-tooltip-content="AniDB does not list this episode yet"
    >
      {UNRESOLVED_AIRING_HINT}
    </span>
  );
};

export const EntryTitle = ({ airing }: { airing: EpisodeAiringType }) => (
  <SeriesLink
    {...getAiringSeriesIds(airing)}
    className="truncate font-semibold hover:text-panel-text-primary"
    tooltip={airing.Series?.Title}
  >
    {airing.Series?.Title ?? 'Unknown Series'}
  </SeriesLink>
);

export const EntryPoster = ({ airing, className }: { airing: EpisodeAiringType, className: string }) => {
  const frameClassName = cx('shrink-0 rounded-lg border border-panel-border drop-shadow-md', className);
  return (
    <SeriesLink {...getAiringSeriesIds(airing)} className="group shrink-0">
      {/* Too small for the "not available" notice, so a missing poster is an empty frame. */}
      {airing.Poster?.Available
        ? <BackgroundImagePlaceholderDiv image={airing.Poster} className={frameClassName} zoomOnHover />
        : <div className={cx(frameClassName, 'bg-panel-input')} />}
    </SeriesLink>
  );
};
