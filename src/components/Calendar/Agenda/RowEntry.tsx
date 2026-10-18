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

const RowEntry = ({ entry, isStriped, now }: Props & { isStriped: boolean }) => {
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

export default RowEntry;
