import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { useMediaQuery } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { SkeletonBlock, SkeletonFade } from '@/components/Utilities/AiringSchedule/Skeleton';
import { pxPerRem } from '@/core/util';
import { getOffsetIn, scrollUnlessThere } from '@/core/utilities/scroll';
import { getSeasonIndex, isSameSeason, seasonOrder } from '@/core/utilities/season';
import { getGridColumnCount } from '@/core/utilities/seasonGrid';
import { isBrowserYearInView } from '@/core/utilities/seasonSlider';

import type { SeasonSummaryType, SeasonYearType } from '@/core/types/api/airing-season';
import type { SeasonKey } from '@/core/utilities/season';

type Props = {
  /** The years with anime, newest first, as the server lists them. */
  years: SeasonYearType[];
  /** The season the season view shows, outlined. */
  season: SeasonKey;
  onSeasonSelect: (season: SeasonKey) => void;
  /**
   * Centre the season's year in the view once drawn, unless some of it is in view already, leaving out this much of the
   * scroll container's top, which the stuck slider covers. `undefined` leaves the scroll as it is.
   */
  revealInset?: number;
};

// A season whose image is not available keeps the empty card rather than a notice.
const SeasonImage = ({ image, position }: { image: SeasonSummaryType['poster'], position?: string }) =>
  image?.Available && (
    <div className="absolute inset-0">
      <BackgroundImagePlaceholderDiv image={image} className="size-full" position={position} zoomOnHover />
    </div>
  );

// The cards' grid, in rem: one column, two from 24rem wide, three from 33rem and four from 50rem. Cards 16rem wide or
// more take a wide frame, which the column steps keep to one column and the widest four.
const columnThresholds = [24, 33, 50];
const cardGap = 1;
const wideCardWidth = 16;
// A year's title and the space below it, and the space between the years.
const yearTitleHeight = 2.55;
const yearGap = 1.5;

/** The columns of cards at the width, and whether the cards take the wide frame. */
const getCardLayout = (width: number) => {
  const columns = getGridColumnCount(width, columnThresholds.map(threshold => threshold * pxPerRem));
  const cardWidth = (width - (columns - 1) * cardGap * pxPerRem) / columns;
  return { columns, cardWidth, isWide: cardWidth >= wideCardWidth * pxPerRem };
};

type CardLayoutType = ReturnType<typeof getCardLayout>;

const getColumnsTemplate = (columns: number) => `repeat(${columns}, minmax(0, 1fr))`;

// Narrow cards show the pick's poster. Wide ones show its backdrop, else the poster cropped to the wide frame with
// the window a quarter of the way down, so faces near the top stay in view.
const SeasonBrowserCard = (
  { isSelected, isWide, onSelect, summary }: {
    isSelected: boolean;
    isWide: boolean;
    onSelect: () => void;
    summary: SeasonSummaryType;
  },
) => (
  <button
    type="button"
    onClick={onSelect}
    aria-current={isSelected ? 'true' : undefined}
    className={cx(
      'group relative isolate overflow-hidden rounded-lg border border-panel-border bg-panel-input text-left drop-shadow-md',
      isWide ? 'aspect-video' : 'aspect-3/4',
      isSelected && 'ring-3 ring-panel-icon-action ring-offset-2 ring-offset-panel-background',
    )}
  >
    {!isWide && <SeasonImage image={summary.poster ?? summary.backdrop} />}
    {isWide && (summary.backdrop?.Available
      ? <SeasonImage image={summary.backdrop} />
      : <SeasonImage image={summary.poster} position="50% 25%" />)}
    <div className="absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent px-3 pt-16 pb-3 text-white">
      <span className="flex items-center gap-x-2 text-lg font-semibold">
        {summary.key.season}
        {summary.isCurrent && <span className="text-sm text-panel-text-primary">Now</span>}
      </span>
      <span className="text-sm opacity-85">{`${summary.count} Anime`}</span>
    </div>
  </button>
);

/**
 * The years while they load, of four season cards shaped like the real ones: three years, or as many as make about
 * three rows of cards when a year takes more than one.
 */
export const SeasonBrowserSkeleton = () => {
  const [measureRef, { width }] = useMeasure();
  const layout = getCardLayout(width);
  const yearCount = Math.ceil(3 / Math.ceil(seasonOrder.length / layout.columns));
  return (
    <div ref={measureRef} className="w-full">
      <SkeletonFade className="flex flex-col gap-y-6">
        {width > 0
          && Array.from({ length: yearCount }, (_, yearIndex) => (
            <div key={yearIndex} className="flex flex-col gap-y-3">
              <div className="flex h-[1.8rem] items-center">
                <SkeletonBlock className="h-5 w-14" />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: getColumnsTemplate(layout.columns) }}>
                {seasonOrder.map(name => (
                  <div
                    key={name}
                    className={cx(
                      'relative rounded-lg border border-panel-border bg-panel-background-alt drop-shadow-md',
                      layout.isWide ? 'aspect-video' : 'aspect-3/4',
                    )}
                  >
                    <div className="absolute inset-x-3 bottom-3 flex flex-col gap-y-2">
                      <SkeletonBlock className="h-5 w-20" />
                      <SkeletonBlock className="h-3.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </SkeletonFade>
    </div>
  );
};

// One virtual row per year: its header and its cards, as many rows of them as the columns make. The rows are measured
// once drawn; this is a first guess.
const estimateYearHeight = ({ cardWidth, columns, isWide }: CardLayoutType, cardCount: number) => {
  const rows = Math.ceil(cardCount / columns);
  const cardHeight = cardWidth * (isWide ? 9 / 16 : 4 / 3);
  return (yearTitleHeight + yearGap + (rows - 1) * cardGap) * pxPerRem + rows * cardHeight;
};

/**
 * Every year with anime, newest first, each with a card per season that picks it. The years are a virtual list on the
 * main page's scroll container.
 */
const SeasonBrowser = ({ onSeasonSelect, revealInset, season, years }: Props) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Kept as state, so the list is drawn again with its offset once it is in place.
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const [measureRef, { width }] = useMeasure();
  const layout = getCardLayout(width);

  // The seasons after the last listed one, still to be announced, get no card.
  const lastIndex = Math.max(...years.flatMap(item => item.seasons).map(item => getSeasonIndex(item.key)));
  const getYearSeasons = (year: number) =>
    seasonOrder.filter(name => getSeasonIndex({ year, season: name }) <= lastIndex);

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    // None until the width is known, so the rows' first guesses are made for it.
    count: width > 0 ? years.length : 0,
    getScrollElement: () => scrollRef.current,
    // Mounted where the page is scrolled to, without scrolling it there again.
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    scrollToFn: scrollUnlessThere,
    estimateSize: index => estimateYearHeight(layout, getYearSeasons(years[index].year).length),
    // Where the list starts in the scroll container, below the page's header and the slider.
    scrollMargin: getOffsetIn(listElement, scrollRef.current),
    // Centring on the view below the slider: the view's middle is half the slider lower.
    scrollPaddingStart: (revealInset ?? 0) / 2,
    overscan: 2,
  });

  // Once, when the list is in place and its rows can be guessed.
  const selectedIndex = years.findIndex(item => item.year === season.year);
  const isRevealed = useRef(false);
  useEffect(() => {
    const container = scrollRef.current;
    // The drawn rows are measured by now; the others are still guesses.
    const item = rowVirtualizer.getVirtualItems().find(row => row.index === selectedIndex)
      ?? rowVirtualizer.measurementsCache[selectedIndex];
    if (revealInset === undefined || isRevealed.current || !container || !listElement || width === 0 || !item) return;
    isRevealed.current = true;
    // Judged where the page is now: at the stick point, when the browser opened with the slider stuck.
    if (isBrowserYearInView(item, container.scrollTop, revealInset, container.clientHeight)) return;
    rowVirtualizer.scrollToIndex(selectedIndex, { align: 'center', behavior: reduceMotion ? 'instant' : 'smooth' });
  }, [listElement, reduceMotion, revealInset, rowVirtualizer, scrollRef, selectedIndex, width]);

  if (years.length === 0) {
    return (
      <div className="flex grow flex-col items-center justify-center gap-y-2 py-16 text-center font-semibold">
        <span>No anime known for any season.</span>
        <span className="opacity-65">Only anime the server has AniDB data for are listed.</span>
      </div>
    );
  }

  const { scrollMargin } = rowVirtualizer.options;
  return (
    <div ref={measureRef} className="w-full">
      <div ref={setListElement} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const { seasons, year } = years[virtualRow.index];
          return (
            <div
              key={year}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 flex w-full flex-col gap-y-3 pb-6"
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              <div className="text-lg font-semibold">{year}</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: getColumnsTemplate(layout.columns) }}>
                {getYearSeasons(year).map((name) => {
                  const key: SeasonKey = { year, season: name };
                  // A season the server leaves out of a year still gets its empty card.
                  const summary = seasons.find(item => isSameSeason(item.key, key))
                    ?? { key, count: 0, isCurrent: false, poster: null, backdrop: null };
                  return (
                    <SeasonBrowserCard
                      key={name}
                      summary={summary}
                      isSelected={isSameSeason(key, season)}
                      isWide={layout.isWide}
                      onSelect={() => onSeasonSelect(key)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonBrowser;
