import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AnimationEvent, ReactNode, RefObject } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { useMediaQuery, useResizeObserver } from 'usehooks-ts';

import SeasonBrowser from '@/components/Utilities/AiringSchedule/SeasonBrowser';
import SeasonCard from '@/components/Utilities/AiringSchedule/SeasonCard';
import SeasonSlider from '@/components/Utilities/AiringSchedule/SeasonSlider';
import { FadeIn, SkeletonBlock, SkeletonFade, SkeletonRest } from '@/components/Utilities/AiringSchedule/Skeleton';
import { pxPerRem } from '@/core/util';
import { getOffsetIn, scrollUnlessThere } from '@/core/utilities/scroll';
import { seasonKeyToValue } from '@/core/utilities/season';
import { getGridColumnCount, getSeasonGridRows, getSkeletonRowCount } from '@/core/utilities/seasonGrid';
import { getBrowserCloseScroll, getBrowserOpenPin, getBrowserOpenScroll } from '@/core/utilities/seasonSlider';

import type { SeasonSectionType, SeasonYearType } from '@/core/types/api/airing-season';
import type { SeasonKey } from '@/core/utilities/season';
import type { SeasonGridRowType } from '@/core/utilities/seasonGrid';
import type { BrowserOpenScrollType, SeasonSlideType } from '@/core/utilities/seasonSlider';

type Props = {
  /** The season's anime by section, each with its next new episode's airings, grouped and sorted by the server. */
  sections: SeasonSectionType[];
  season: SeasonKey;
  /** The listed seasons for the slider, oldest first, read with the anime's filters so the counts match. */
  strip: SeasonSlideType[];
  /** Shown below the slider instead of the anime, while they load or when they failed to. */
  fallback?: ReactNode;
  /** Mark the anime in the collection, which says nothing when only the collection is shown. */
  showCollectionBadge: boolean;
  onSeasonChange: (season: SeasonKey) => void;
  /** Whether the season browser is open in the anime's place. */
  isBrowsing: boolean;
  onBrowseToggle: () => void;
  /** Every year with anime for the browser, newest first, with the seasons' images. */
  years: SeasonYearType[];
  /** Shown instead of the browser's years, while they load or when they failed to. */
  browserFallback?: ReactNode;
  /** A season picked in the browser, which closes it. */
  onSeasonPick: (season: SeasonKey) => void;
};

type PaneType = 'anime' | 'browser';

/** The page's scroll around the season browser, taken as it opens and again as it starts to close. */
type BrowserScrollType = {
  /** `null` for a page loaded with the browser open. */
  opened: BrowserOpenScrollType | null;
  /** `null` until the browser starts to close, and when Back or Forward closes it. */
  scrollTop: number | null;
  /** Where the slider starts to stick. */
  stickTop: number;
  /** The view's height less the panes' offset, so panes this much taller than a scroll offset can reach it. */
  viewInset: number;
  /** Whether a season was picked, which always ends with the slider stuck. */
  isPick: boolean;
};

// The cards' grid, in rem: one column, two from 56rem wide and three from 84rem, so a card beside another is never much
// narrower than 27rem.
const columnThresholds = [56, 84];
const cardHeight = 16;
const cardGap = 1;
// A section's title, the space below it, and the space between the sections.
const titleHeight = 1.75;
const titleGap = 0.75;
const sectionGap = 1.5;

// None until the width is known.
const getColumnCount = (width: number) => {
  if (width === 0) return 0;
  return getGridColumnCount(width, columnThresholds.map(threshold => threshold * pxPerRem));
};

const getColumnsTemplate = (columns: number) => `repeat(${columns}, minmax(0, 1fr))`;

/**
 * Marks the slider's block `data-stuck` while the sentinel above it is out of the scroll container's view, which the
 * stuck look keys on. Set on the element itself, so it switches in the frame the slider sticks, without a render.
 */
const markStuck = (block: HTMLElement | null, sentinel: HTMLElement | null, container: HTMLElement | null) => {
  if (!block || !sentinel || !container) return;
  const viewTop = container.getBoundingClientRect().top + container.clientTop;
  block.toggleAttribute('data-stuck', sentinel.getBoundingClientRect().bottom < viewTop);
};

/** The height of the scroll container's view. */
const useViewHeight = () => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement> }>();
  const { height = 0 } = useResizeObserver({ ref: scrollRef, box: 'border-box' });
  return height;
};

/** The rows of cards in the skeleton, enough to fill the scroll container's view, and its height with its title. */
const useSkeletonRows = () => {
  const height = useViewHeight();
  const count = getSkeletonRowCount(height, (cardHeight + cardGap) * pxPerRem);
  return { count, height: (titleHeight + titleGap + count * (cardHeight + cardGap) - cardGap) * pxPerRem };
};

const titleWidths = ['w-3/4', 'w-full', 'w-2/3'];

/** A card shaped like a {@link SeasonCard}: the poster with its title, then the airing, details, overview and tags. */
const SeasonCardSkeleton = ({ index }: { index: number }) => (
  <div className="@container flex h-64 overflow-hidden rounded-lg border border-panel-border bg-panel-background-alt">
    <div className="relative w-28 shrink-0 bg-panel-input @sm:w-44">
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-y-1.5 bg-panel-background-overlay p-3">
        <SkeletonBlock className={cx('h-3.5', titleWidths[index % titleWidths.length])} />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex min-w-0 grow flex-col gap-y-2 p-3 @sm:p-4">
      <div className="flex flex-col gap-y-1.5">
        <SkeletonBlock className="h-3.5 w-24" />
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="h-3.5 w-40" />
      </div>
      <SkeletonBlock className="h-3.5 w-1/2" />
      <div className="flex flex-col gap-y-1.5">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
      <div className="mt-auto flex gap-1">
        <SkeletonBlock className="h-6 w-16 rounded-lg" />
        <SkeletonBlock className="h-6 w-20 rounded-lg" />
        <SkeletonBlock className="h-6 w-14 rounded-lg" />
      </div>
    </div>
  </div>
);

const SkeletonCards = ({ columns, rows }: { columns: number, rows: number }) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: getColumnsTemplate(columns) }}>
    {Array.from({ length: rows * columns }, (_, index) => <SeasonCardSkeleton key={index} index={index} />)}
  </div>
);

/** The season's anime while they load: a section's title over rows of card skeletons, in the cards' grid. */
export const SeasonViewSkeleton = () => {
  const [measureRef, { width }] = useMeasure();
  const rows = useSkeletonRows();
  return (
    <SkeletonFade className="flex flex-col gap-y-3">
      <div className="flex h-[1.8rem] items-center">
        <SkeletonBlock className="h-5 w-28" />
      </div>
      <div ref={measureRef} style={{ minHeight: (rows.count * (cardHeight + cardGap) - cardGap) * pxPerRem }}>
        <SkeletonCards columns={getColumnCount(width)} rows={rows.count} />
      </div>
    </SkeletonFade>
  );
};

/** The space below a row: the grid's gap within a section, the sections' gap after its last row, none at the end. */
const getRowGapClassName = (row: SeasonGridRowType, isLast: boolean) => {
  if (isLast) return undefined;
  if (row.type === 'title') return 'pb-3';
  return row.isSectionEnd ? 'pb-6' : 'pb-4';
};

// The rows are measured once drawn; this is a first guess, in px.
const estimateRowHeight = (row: SeasonGridRowType, isLast: boolean) => {
  if (row.type === 'title') return (titleHeight + titleGap) * pxPerRem;
  if (isLast) return cardHeight * pxPerRem;
  return (cardHeight + (row.isSectionEnd ? sectionGap : cardGap)) * pxPerRem;
};

/**
 * The sections' titles and rows of cards as a virtual list on the main page's scroll container, so only the cards in
 * view are drawn. Scrolling draws this list again, and not the slider above it.
 */
const SeasonGrid = (
  { sections, showCollectionBadge }: { sections: SeasonSectionType[], showCollectionBadge: boolean },
) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  // Kept as state, so the list is drawn again with its offset once it is in place.
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [measureRef, { width }] = useMeasure();

  const columns = getColumnCount(width);
  const rows = columns > 0 ? getSeasonGridRows(sections, columns) : [];
  // A season shorter than the skeleton keeps the rest of it, so the pane never gets shorter than the view.
  const skeletonRows = useSkeletonRows();
  const restRows = columns > 0 ? skeletonRows.count - rows.filter(row => row.type === 'cards').length : 0;

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    // Mounted where the page is scrolled to, without scrolling it there again.
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    scrollToFn: scrollUnlessThere,
    getItemKey: index => rows[index].key,
    estimateSize: index => estimateRowHeight(rows[index], index === rows.length - 1),
    // Where the list starts in the scroll container, below the page's header and the slider.
    scrollMargin: getOffsetIn(listElement, scrollRef.current),
    overscan: 2,
  });
  const { scrollMargin } = rowVirtualizer.options;

  return (
    // Until the width is known there are no rows; the skeleton's height keeps the scroll where it is.
    <div ref={measureRef} className="w-full" style={{ minHeight: skeletonRows.height }}>
      <div ref={setListElement} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className={cx(
                'absolute top-0 left-0 w-full',
                getRowGapClassName(row, virtualRow.index === rows.length - 1),
              )}
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              {row.type === 'title'
                ? (
                  <div className="flex items-center gap-x-2 text-lg font-semibold">
                    {row.section.Title}
                    <span className="text-sm font-normal opacity-65">{row.section.Anime.length}</span>
                  </div>
                )
                : (
                  // The same columns in every row, so the rows line up as one grid.
                  <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: getColumnsTemplate(columns) }}
                  >
                    {row.anime.map(item => (
                      <SeasonCard key={item.ID} anime={item} showCollectionBadge={showCollectionBadge} />
                    ))}
                  </div>
                )}
            </div>
          );
        })}
      </div>
      {restRows > 0 && (
        <SkeletonRest className="pt-4" height={skeletonRows.height}>
          <SkeletonCards columns={columns} rows={restRows} />
        </SkeletonRest>
      )}
    </div>
  );
};

/**
 * The anime of one season, by section, as cards with the countdown to their next episode. The season browser takes
 * their place while open, the two cross-fading.
 */
const SeasonView = (
  {
    browserFallback,
    fallback,
    isBrowsing,
    onBrowseToggle,
    onSeasonChange,
    onSeasonPick,
    season,
    sections,
    showCollectionBadge,
    strip,
    years,
  }: Props,
) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Opening the browser from the slider brings the shown season's year into view below the stuck slider, whose height
  // this is. Dropped as the browser closes, so neither its leaving pane nor a page loaded with it open does.
  const [revealInset, setRevealInset] = useState<number | undefined>(undefined);

  // Opened while scrolled past the stick point, the page goes up to it as the browser comes in, so the slider stays
  // stuck. The leaving anime are lifted as far, so they fade out where they were.
  const openPinRef = useRef<number | null>(null);
  const [leavingShift, setLeavingShift] = useState(0);
  // The browser fills the view at least, so the stick point stays in reach however few years it has.
  const viewHeight = useViewHeight();

  // The pane shown, and the one fading out over it until its animation ends.
  const pane: PaneType = isBrowsing ? 'browser' : 'anime';
  const [shown, setShown] = useState(pane);
  const [leaving, setLeaving] = useState<PaneType | null>(null);

  // Closing the browser goes back to where the page was when it opened, while the same season is shown; else up to
  // where the slider sticks, when scrolled past it. Until the scroll gets there, the panes keep the height to reach it,
  // so the shorter anime cannot cut the scroll short.
  const [browserScroll, setBrowserScroll] = useState<BrowserScrollType | null>(null);
  const [pendingScroll, setPendingScroll] = useState<
    { top: number, restore: boolean, minHeight: number | null } | null
  >(null);

  if (shown !== pane) {
    setShown(pane);
    setLeaving(reduceMotion ? null : shown);
    setPendingScroll(null);
    if (pane === 'anime') {
      setRevealInset(undefined);
      setLeavingShift(0);
      // Back finds the scroll on the entry the browser opened from, even after a reload.
      const opened = getBrowserOpenScroll(window.history.state) ?? browserScroll?.opened ?? null;
      const scroll = getBrowserCloseScroll(
        opened,
        season,
        browserScroll?.scrollTop ?? 0,
        browserScroll?.stickTop ?? 0,
        browserScroll?.isPick,
      );
      if (scroll) setPendingScroll({ ...scroll, minHeight: browserScroll && scroll.top + browserScroll.viewInset });
      setBrowserScroll(browserScroll && { ...browserScroll, scrollTop: null, isPick: false });
    }
  }

  const handleLeavingEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setLeaving(null);
  };

  // The slider sticks half a rem below the top of the page's scroll container. The sentinel lies as far above it, so
  // it leaves the container's view just as the slider sticks.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Judged from the layout on every scroll, which runs before the frame is drawn, and as the view or the page resizes.
  useEffect(() => {
    const container = scrollRef.current;
    const update = () => markStuck(stickyRef.current, sentinelRef.current, container);
    if (!container) return undefined;
    update();
    container.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (stickyRef.current?.parentElement) observer.observe(stickyRef.current.parentElement);
    return () => {
      container.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [scrollRef]);

  // The scroll offset where the slider starts to stick.
  const getStickOffset = () => getOffsetIn(sentinelRef.current, scrollRef.current);

  const measureScroll = (opened: BrowserOpenScrollType | null, scrollTop: number | null, isPick = false) => {
    const container = scrollRef.current;
    if (!container) return;
    setBrowserScroll({
      opened,
      scrollTop,
      stickTop: getStickOffset(),
      viewInset: container.clientHeight - getOffsetIn(contentRef.current, container),
      isPick,
    });
  };

  // Taken while the browser still shows, before anything closes it.
  const prepareClose = (isPick = false) =>
    measureScroll(browserScroll?.opened ?? null, scrollRef.current?.scrollTop ?? null, isPick);

  const handleBrowseToggle = () => {
    if (isBrowsing) prepareClose();
    else {
      // Also kept on the history entry being left, so Back to it finds it.
      const opened = { season: seasonKeyToValue(season), top: scrollRef.current?.scrollTop ?? 0 };
      window.history.replaceState({ ...(window.history.state as object | null), airingScheduleScroll: opened }, '');
      measureScroll(opened, null);
      const pin = getBrowserOpenPin(opened.top, getStickOffset());
      openPinRef.current = pin;
      setLeavingShift(pin === null ? 0 : pin - opened.top);
      setRevealInset(barRef.current?.offsetHeight ?? 0);
    }
    onBrowseToggle();
  };

  useHotkeys('escape', handleBrowseToggle, { scopes: 'primary', enabled: isBrowsing });

  const handleSeasonPick = (key: SeasonKey) => {
    prepareClose(true);
    onSeasonPick(key);
  };

  // At once as the browser comes in, before it is drawn, so the page never shows cut short to the shorter browser.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    const top = openPinRef.current;
    if (shown !== 'browser' || top === null || !container) return;
    openPinRef.current = null;
    container.scrollTo({ top, behavior: 'instant' });
    markStuck(stickyRef.current, sentinelRef.current, container);
  }, [scrollRef, shown]);

  // Once the anime pane is in, a frame later, so the lists mounting with it cannot stop the scroll by keeping theirs.
  useEffect(() => {
    const container = scrollRef.current;
    if (!pendingScroll || shown !== 'anime' || !container) return undefined;
    const { minHeight, restore, top } = pendingScroll;
    const behavior = restore || reduceMotion ? 'instant' : 'smooth';
    const release = () => setPendingScroll(null);
    const isThere = () => Math.abs(container.scrollTop - top) < 1;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;
    const scroll = () => {
      tries += 1;
      container.scrollTo({ top, behavior });
      markStuck(stickyRef.current, sentinelRef.current, container);
      // A browser without the scroll's end event, or a scroll that never ends there, lands at once.
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isThere()) {
          container.scrollTo({ top, behavior: 'instant' });
          markStuck(stickyRef.current, sentinelRef.current, container);
        }
        release();
      }, 1000);
    };
    // The lists mounting or measuring on the way can stop the scroll short, so it goes on from there. A restore lands at
    // once; its hold stays until the lists have their height.
    const handleScrollEnd = () => {
      if (!isThere() && tries < 3) scroll();
      else if (!restore) release();
    };
    const frame = requestAnimationFrame(() => {
      // Closed without the browser's measures, as by Back after a reload, the hold is measured now, a frame late.
      if (minHeight === null) {
        const viewInset = container.clientHeight - getOffsetIn(contentRef.current, container);
        setPendingScroll({ ...pendingScroll, minHeight: top + viewInset });
        return;
      }
      container.addEventListener('scrollend', handleScrollEnd);
      scroll();
    });
    // Scrolling by hand takes over.
    container.addEventListener('wheel', release, { passive: true });
    container.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('keydown', release);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      container.removeEventListener('scrollend', handleScrollEnd);
      container.removeEventListener('wheel', release);
      container.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, [pendingScroll, reduceMotion, scrollRef, shown]);

  const renderPane = (type: PaneType) => {
    if (type === 'browser') {
      return browserFallback ?? (
        <SeasonBrowser years={years} season={season} onSeasonSelect={handleSeasonPick} revealInset={revealInset} />
      );
    }
    if (fallback) return fallback;
    // The anime fade in where the fallback was.
    return (
      <FadeIn className="flex grow flex-col">
        {sections.length === 0
          ? (
            <div className="flex grow flex-col items-center justify-center gap-y-2 py-16 text-center font-semibold">
              <span>No anime known for this season.</span>
              <span className="opacity-65">Only anime the server has AniDB data for are listed.</span>
            </div>
          )
          : <SeasonGrid sections={sections} showCollectionBadge={showCollectionBadge} />}
      </FadeIn>
    );
  };

  // Stuck, the slider lies on a frosted bar from the container's top to just below the seasons, leaving out the hidden
  // hint. The bar is out of flow and the hint keeps its place, so the block's height, and the content below, never move.
  // Both switch at once, in step with the slider sticking.
  return (
    <div className="relative flex grow flex-col gap-y-6">
      <div ref={sentinelRef} aria-hidden className="pointer-events-none absolute inset-x-0 -top-2 h-px" />
      {/* Half a rem below the container's edge: sticky positions count from inside its 1.5rem top padding. */}
      <div ref={stickyRef} className="pointer-events-none sticky -top-4 z-10">
        <div
          ref={barRef}
          aria-hidden
          className="absolute -inset-x-6 -top-2 bottom-3 border-b border-panel-border bg-panel-background/50 opacity-0 backdrop-blur-sm in-data-stuck:pointer-events-auto in-data-stuck:opacity-100"
        />
        <div className="relative">
          <SeasonSlider
            strip={strip}
            season={season}
            isBrowsing={isBrowsing}
            onBrowseToggle={handleBrowseToggle}
            onSeasonChange={onSeasonChange}
          />
        </div>
      </div>

      {/* The leaving pane lies over the shown one, which sets the height, and is cut to it. */}
      <div
        ref={contentRef}
        className={cx('relative flex grow flex-col', leaving && 'overflow-hidden')}
        style={pendingScroll?.minHeight ? { minHeight: pendingScroll.minHeight } : undefined}
      >
        {leaving && (
          <div
            key={leaving}
            aria-hidden
            inert
            className="pointer-events-none absolute inset-x-0 top-0 flex animate-pane-out flex-col"
            style={leaving === 'anime' && leavingShift !== 0 ? { top: leavingShift } : undefined}
            onAnimationEnd={handleLeavingEnd}
          >
            {renderPane(leaving)}
          </div>
        )}
        <div
          key={shown}
          className={cx('flex grow flex-col', leaving && 'animate-pane-in')}
          style={shown === 'browser' ? { minHeight: viewHeight } : undefined}
        >
          {renderPane(shown)}
        </div>
      </div>
    </div>
  );
};

export default SeasonView;
