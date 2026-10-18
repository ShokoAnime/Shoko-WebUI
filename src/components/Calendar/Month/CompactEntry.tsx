import cx from 'classnames';

import { LocalFilesIcon, NowBadge } from '@/components/Calendar/AiringEntryParts';
import SeriesLink from '@/components/Calendar/SeriesLink';
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

const CompactEntry = ({ entry, now }: Props) => {
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

export default CompactEntry;
