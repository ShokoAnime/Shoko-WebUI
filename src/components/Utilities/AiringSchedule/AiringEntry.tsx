import { useState } from 'react';
import { Link } from 'react-router';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { mdiChevronDown, mdiChevronUp, mdiEyeOffOutline, mdiFileDocumentMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import AiringProviderIcon from '@/components/AiringProviderIcon';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { Badge } from '@/components/Badge';
import { dayjs, getAnidbAnimeLink } from '@/core/util';
import {
  UNRESOLVED_AIRING_HINT,
  getAiringAnidbAnimeId,
  getAiringEpisodeLabel,
  getAiringShokoSeriesId,
  getAiringVideoCount,
  isAiringNow,
} from '@/core/utilities/airingSchedule';
import useAiringProviderContext from '@/hooks/useAiringProviderContext';
import useNow from '@/hooks/useNow';

import type { AiringChannelReferenceType, AiringKindType, EpisodeAiringType } from '@/core/types/api/airing-schedule';
import type { CalendarEntryType } from '@/core/utilities/airingSchedule';

/** Switches a channel off in the airing schedule's channel filter. */
export type HideChannelHandler = (channel: AiringChannelReferenceType) => void;

type Props = {
  entry: CalendarEntryType;
  onHideChannel?: HideChannelHandler;
  /** Show a badge for each kind of the airing, when every kind is shown together. */
  showKinds?: boolean;
  /** Fill the `row` variant's background, for every other row of a day. */
  striped?: boolean;
  variant: 'compact' | 'card' | 'row';
};

const SeriesLink = (
  { className, entry, showTooltip = true }: { className?: string, entry: CalendarEntryType, showTooltip?: boolean },
) => {
  const { airing } = entry;
  const title = airing.Series?.Title ?? 'Unknown Series';
  const shokoId = getAiringShokoSeriesId(airing);
  const anidbId = getAiringAnidbAnimeId(airing);

  if (shokoId) {
    return (
      <Link
        to={`/webui/collection/series/${shokoId}`}
        className={cx('truncate font-semibold hover:text-panel-text-primary', className)}
        data-tooltip-id={showTooltip ? 'tooltip' : undefined}
        data-tooltip-content={title}
        data-tooltip-delay-show={500}
      >
        {title}
      </Link>
    );
  }

  if (anidbId) {
    return (
      <a
        href={getAnidbAnimeLink(anidbId)}
        target="_blank"
        rel="noopener noreferrer"
        className={cx('truncate font-semibold hover:text-panel-text-primary', className)}
        data-tooltip-id={showTooltip ? 'tooltip' : undefined}
        data-tooltip-content={`${title} (not in collection, opens AniDB)`}
        data-tooltip-delay-show={500}
      >
        {title}
      </a>
    );
  }

  return <span className={cx('truncate font-semibold', className)}>{title}</span>;
};

/** The series poster, from `include=Poster`, linked like the title. */
const Poster = ({ className, entry }: { className: string, entry: CalendarEntryType }) => {
  const { airing } = entry;
  const shokoId = getAiringShokoSeriesId(airing);
  const frameClassName = cx('shrink-0 rounded-lg border border-panel-border drop-shadow-md', className);
  // Too small for the "not available" notice, so a missing poster is an empty frame.
  const poster = airing.Poster?.Available
    ? <BackgroundImagePlaceholderDiv image={airing.Poster} className={frameClassName} zoomOnHover />
    : <div className={cx(frameClassName, 'bg-panel-input')} />;
  if (!shokoId) return poster;
  return (
    <Link to={`/webui/collection/series/${shokoId}`} className="group shrink-0">
      {poster}
    </Link>
  );
};

const getBadges = (entry: CalendarEntryType) => {
  const { airing, movedFrom, movedTo } = entry;
  const badges: { text: string, tooltip?: string, warning?: boolean }[] = [];
  if (movedTo) {
    badges.push({ text: 'Moved', tooltip: `Moved to ${movedTo.format('ddd, MMM D, HH:mm')}`, warning: true });
  }
  if (movedFrom) {
    badges.push({ text: 'Delayed', tooltip: `Delayed from ${movedFrom.format('ddd, MMM D, HH:mm')}`, warning: true });
  }
  if (airing.Kind === 'Advance') badges.push({ text: 'Advance', tooltip: 'An advance screening' });
  if (airing.Kind === 'Rerun') badges.push({ text: 'Rerun', tooltip: 'A rerun, as the provider marked it' });
  if (airing.Kind === 'DetectedRerun') badges.push({ text: 'Rerun', tooltip: 'A rerun, as Shoko detected it' });
  if (airing.IsEstimated) badges.push({ text: 'Estimated', tooltip: 'Estimated from the schedule' });
  return badges;
};

const kindOrder: AiringKindType[] = ['Original', 'Subtitled', 'Dubbed'];
const kindLabels: Record<AiringKindType, string> = { Original: 'Original', Subtitled: 'Sub', Dubbed: 'Dub' };

/** The kinds of the airing's tracks, in a fixed order. */
const getKinds = (entry: CalendarEntryType) => {
  const kinds = new Set(entry.airing.Tracks.map(track => track.Kind));
  return kindOrder.filter(kind => kinds.has(kind));
};

const KindBadges = ({ entry }: { entry: CalendarEntryType }) => (
  <>
    {getKinds(entry).map(kind => (
      <Badge key={kind} className="bg-panel-tags">
        <span data-tooltip-id="tooltip" data-tooltip-content={kind}>{kindLabels[kind]}</span>
      </Badge>
    ))}
  </>
);

const Badges = ({ entry }: { entry: CalendarEntryType }) => (
  <>
    {getBadges(entry).map(badge => (
      <span
        key={badge.text}
        className={cx(
          'rounded-sm border px-1.5 text-xs',
          badge.warning ? 'border-panel-text-warning text-panel-text-warning' : 'border-panel-border opacity-80',
        )}
        data-tooltip-id={badge.tooltip ? 'tooltip' : undefined}
        data-tooltip-content={badge.tooltip}
      >
        {badge.text}
      </span>
    ))}
  </>
);

/** `Now` while the airing is on air, though not at the slot it was moved out of. */
const NowBadge = (
  { className, entry, showTooltip = true }: { className?: string, entry: CalendarEntryType, showTooltip?: boolean },
) => {
  const now = useNow();
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

const formatLocalFiles = (count: number) => `${count} local ${count === 1 ? 'file' : 'files'}`;

/** The collection's files icon, muted, when the airing's episode has local files. */
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

/** `Not on AniDB yet`, muted, after the label of an unresolved airing, whose episode AniDB does not list yet. */
export const UnresolvedHint = ({ airing, className }: { airing: EpisodeAiringType, className?: string }) => {
  if (airing.IsResolved) return null;
  return (
    <span
      className={cx('shrink-0 text-xs opacity-65', className)}
      data-tooltip-id="tooltip"
      data-tooltip-content="AniDB does not list this episode yet"
    >
      {UNRESOLVED_AIRING_HINT}
    </span>
  );
};

const getWhere = (entry: CalendarEntryType) => {
  const { Channel, IsDateOnly, Source } = entry.airing;
  if (IsDateOnly) return 'AniDB air date';
  return [Channel?.Name, Source?.Name].filter(Boolean).join(' · ');
};

/** The entry's time, or `All Day` for a date-only airing. */
const formatEntryTime = (entry: CalendarEntryType, showDay = false) => {
  if (showDay) return entry.time.format(entry.isAllDay ? 'ddd, MMM D' : 'ddd HH:mm');
  return entry.isAllDay ? 'All Day' : entry.time.format('HH:mm');
};

/** The channel, then the provider's icon standing in for its name, and a shortcut to switch the channel off. */
const Where = (
  { className, entry, onHideChannel }: {
    className?: string;
    entry: CalendarEntryType;
    onHideChannel?: HideChannelHandler;
  },
) => {
  const { Channel, IsDateOnly, Source } = entry.airing;
  const provider = useAiringProviderContext(Source?.ID);
  // A date-only airing comes from the AniDB air date, not from a provider.
  if (IsDateOnly) return <span className={cx('flex min-w-0 opacity-65', className)}>AniDB Air Date</span>;
  return (
    <span className={cx('group/where flex min-w-0 items-center gap-x-1.5', className)}>
      {Channel && <span className="truncate opacity-65">{Channel.Name}</span>}
      {Source && (
        <span className="flex shrink-0 opacity-65">
          <AiringProviderIcon
            providerId={Source.ID}
            hasIcon={provider?.HasIcon ?? false}
            label={Source.Name}
            size={0.6667}
          />
        </span>
      )}
      {Channel && onHideChannel && (
        <button
          type="button"
          className="flex shrink-0 text-panel-icon-action opacity-0 transition-opacity group-hover/where:opacity-100 focus-visible:opacity-100"
          onClick={() => onHideChannel(Channel)}
          aria-label={`Hide ${Channel.Name} in this view`}
          data-tooltip-id="tooltip"
          data-tooltip-content={`Hide ${Channel.Name} in this view`}
        >
          <Icon path={mdiEyeOffOutline} size={0.6667} />
        </button>
      )}
    </span>
  );
};

// In the link color, so the count reads as something to click.
const moreButtonClassName = cx(
  'flex shrink-0 items-center gap-x-0.5 rounded-sm border border-panel-border px-1 text-xs font-semibold',
  'text-panel-text-primary transition-colors hover:border-panel-text-primary focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-panel-icon-action',
);

/** One line of text per other airing of the episode that day, for tooltips. */
const getOthersSummary = (entry: CalendarEntryType, showDay = false) =>
  entry.others.map(other =>
    [
      formatEntryTime(other, showDay),
      getWhere(other),
      ...getBadges(other).filter(badge => badge.text !== 'Estimated').map(badge => badge.text),
    ].filter(Boolean).join(' · ')
  );

/**
 * The always visible count of the episode's other airings; clicking it lists them in place. `showDay` names their
 * days, for airings beyond the entry's own day.
 */
export const MoreButton = (
  { entry, expanded, onToggle, showDay = false }: {
    entry: CalendarEntryType;
    expanded: boolean;
    onToggle: () => void;
    showDay?: boolean;
  },
) => {
  if (entry.others.length === 0) return null;
  return (
    <button
      type="button"
      className={moreButtonClassName}
      aria-expanded={expanded}
      onClick={onToggle}
      data-tooltip-id={expanded ? undefined : 'tooltip'}
      data-tooltip-content={`Also airs at ${getOthersSummary(entry, showDay).join(' | ')}`}
      data-tooltip-delay-show={500}
    >
      {`+${entry.others.length} more`}
      <Icon path={expanded ? mdiChevronUp : mdiChevronDown} size={0.5} />
    </button>
  );
};

/** The episode's other airings, one line each, with the shortcut to switch a channel off. */
export const OtherAiringsList = (
  { className, onHideChannel, others, showDay = false }: {
    className?: string;
    onHideChannel?: HideChannelHandler;
    others: CalendarEntryType[];
    showDay?: boolean;
  },
) => (
  <div className={cx('flex min-w-0 flex-col gap-y-1', className)}>
    {others.map(other => (
      <div key={other.airing.ID} className="flex min-w-0 items-center gap-x-1.5">
        <span className={cx('shrink-0 font-semibold', other.movedTo && 'line-through')}>
          {formatEntryTime(other, showDay)}
        </span>
        <Where entry={other} onHideChannel={onHideChannel} />
        <Badges entry={other} />
      </div>
    ))}
  </div>
);

/** The count of the other airings as a toggle for a popover listing them, where the entry has no room for them. */
export const OtherAiringsPopover = (
  { onHideChannel, others }: { onHideChannel?: HideChannelHandler, others: CalendarEntryType[] },
) => {
  if (others.length === 0) return null;
  return (
    <Popover className="flex shrink-0">
      {({ open }) => (
        <>
          <PopoverButton className={moreButtonClassName}>
            {`+${others.length}`}
            <Icon path={open ? mdiChevronUp : mdiChevronDown} size={0.5} />
          </PopoverButton>
          <PopoverPanel
            anchor="bottom start"
            transition
            className="z-50 flex w-72 origin-top-left flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-background-alt p-3 text-sm font-normal text-panel-text drop-shadow-md transition [--anchor-gap:--spacing(1)] data-closed:scale-95 data-closed:opacity-0"
          >
            <span className="font-semibold">
              {others.length === 1 ? 'Also Airs' : `Also Airs ${others.length} Times`}
            </span>
            <OtherAiringsList others={others} onHideChannel={onHideChannel} className="text-xs" />
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
};

const AiringEntry = ({ entry, onHideChannel, showKinds = false, striped = false, variant }: Props) => {
  const { airing, movedTo } = entry;
  const episodeLabel = getAiringEpisodeLabel(airing);
  const videoCount = getAiringVideoCount(airing);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(value => !value);
  const showOthers = expanded && entry.others.length > 0;

  if (variant === 'compact') {
    return (
      <div
        className={cx('flex min-w-0 gap-x-1.5 text-sm', (movedTo !== null || airing.IsEstimated) && 'opacity-65')}
        data-tooltip-id="tooltip"
        data-tooltip-content={[
          airing.Series?.Title,
          episodeLabel,
          airing.IsResolved ? null : UNRESOLVED_AIRING_HINT,
          getWhere(entry),
          ...getBadges(entry).map(badge => badge.tooltip ?? badge.text),
          ...(showKinds ? getKinds(entry) : []),
          videoCount > 0 ? formatLocalFiles(videoCount) : null,
          ...getOthersSummary(entry).map(other => `Also ${other}`),
        ].filter(Boolean).join(' | ')}
        data-tooltip-delay-show={500}
      >
        {!entry.isAllDay && (
          <span className={cx('shrink-0 text-panel-text-important', movedTo && 'line-through')}>
            {formatEntryTime(entry)}
          </span>
        )}
        <NowBadge entry={entry} className="self-center px-1 leading-4" showTooltip={false} />
        {/* The month's rows have no room for the list, so it opens in a popover. */}
        <OtherAiringsPopover others={entry.others} onHideChannel={onHideChannel} />
        <LocalFilesIcon count={videoCount} showTooltip={false} />
        <SeriesLink entry={entry} className="font-normal!" showTooltip={false} />
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={cx('flex items-center gap-x-4 rounded-lg p-3', striped && 'bg-panel-background-alt')}>
        <span className={cx('w-12 shrink-0 font-semibold text-panel-text-important', movedTo && 'line-through')}>
          {!entry.isAllDay && formatEntryTime(entry)}
        </span>
        <Poster entry={entry} className="h-16 w-11" />
        <div className="flex min-w-0 grow basis-0 flex-col">
          <SeriesLink entry={entry} />
          <div className="flex min-w-0 items-center gap-x-1.5 text-sm">
            {episodeLabel && <span className="truncate opacity-65">{episodeLabel}</span>}
            <UnresolvedHint airing={airing} />
            <LocalFilesIcon count={videoCount} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <NowBadge entry={entry} />
          {showKinds && <KindBadges entry={entry} />}
          <Badges entry={entry} />
        </div>
        <div className="flex w-64 shrink-0 flex-col items-end gap-y-1 text-sm">
          <Where entry={entry} className="max-w-full justify-end" onHideChannel={onHideChannel} />
          <MoreButton entry={entry} expanded={expanded} onToggle={toggleExpanded} />
          {showOthers && (
            <OtherAiringsList
              others={entry.others}
              onHideChannel={onHideChannel}
              className="max-w-full items-end text-xs"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        'flex gap-x-2 rounded-lg border border-panel-border bg-panel-background-alt p-2 text-sm',
        (movedTo !== null || airing.IsEstimated) && 'border-dashed',
      )}
    >
      {/* The week's columns only fit a poster on wide screens. */}
      <div className="hidden shrink-0 2xl:block">
        <Poster entry={entry} className="h-20 w-14" />
      </div>
      <div className="flex min-w-0 grow flex-col gap-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex items-center gap-x-1.5">
            <span className={cx('font-semibold text-panel-text-important', movedTo && 'line-through')}>
              {formatEntryTime(entry)}
            </span>
            <NowBadge entry={entry} />
            <MoreButton entry={entry} expanded={expanded} onToggle={toggleExpanded} />
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {showKinds && <KindBadges entry={entry} />}
            <Badges entry={entry} />
          </div>
        </div>
        <SeriesLink entry={entry} />
        {(episodeLabel || videoCount > 0) && (
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
            <LocalFilesIcon count={videoCount} />
          </div>
        )}
        <Where entry={entry} className="text-xs" onHideChannel={onHideChannel} />
        {showOthers && (
          <OtherAiringsList
            others={entry.others}
            onHideChannel={onHideChannel}
            className="border-t border-panel-border pt-1 text-xs"
          />
        )}
      </div>
    </div>
  );
};

export default AiringEntry;
