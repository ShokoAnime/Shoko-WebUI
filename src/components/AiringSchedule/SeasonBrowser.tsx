import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { pxPerRem } from '@/core/util';
import { getLastListedIndex, getYearSeasons, isSameSeason } from '@/core/utilities/season';

import type { SeasonSummaryType, SeasonYearType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey } from '@/core/types/api/airing-season';

type Props = {
  onSeasonSelect: (season: SeasonKey) => void;
  season: SeasonKey;
  years: SeasonYearType[];
};

// Four cards to a year, in rem. A card at least this wide is a wide frame, else a tall one.
const columns = 4;
const cardGap = 1;
const wideCardWidth = 16;
const yearTitleHeight = 2.5;
const yearGap = 1.5;

const SeasonImage = ({ image, position }: { image: SeasonSummaryType['poster'], position?: string }) =>
  image?.Available && (
    <div className="absolute inset-0">
      <BackgroundImagePlaceholderDiv image={image} className="size-full" position={position} zoomOnHover />
    </div>
  );

/** A wide frame takes the backdrop, else the poster with its window a quarter of the way down, for the faces. */
const CardImage = ({ isWide, summary }: { isWide: boolean, summary: SeasonSummaryType }) => {
  if (!isWide) return <SeasonImage image={summary.poster ?? summary.backdrop} />;
  if (summary.backdrop?.Available) return <SeasonImage image={summary.backdrop} />;
  return <SeasonImage image={summary.poster} position="50% 25%" />;
};

const SeasonBrowserCard = (
  { height, isSelected, isWide, onSelect, summary }: {
    height: number;
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
    style={{ height }}
    className={cx(
      'group relative isolate overflow-hidden rounded-lg border border-panel-border bg-panel-input text-left',
      'drop-shadow-md',
      isSelected && 'ring-3 ring-panel-icon-action ring-offset-2 ring-offset-panel-background',
    )}
  >
    <CardImage isWide={isWide} summary={summary} />
    <div className="absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-black via-black/70 to-transparent px-3 pt-16 pb-3 text-white">
      <span className="flex items-center gap-x-2 text-lg font-semibold">
        {summary.key.season}
        {summary.isCurrent && <span className="text-sm text-panel-text-primary">Now</span>}
      </span>
      <span className="text-sm opacity-85">{`${summary.count} Anime`}</span>
    </div>
  </button>
);

const SeasonBrowser = ({ onSeasonSelect, season, years }: Props) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  const [containerRef, { width }] = useMeasure();

  // The cards keep their frame's shape, so a year's height follows from the width.
  const cardWidth = (width - (columns - 1) * cardGap * pxPerRem) / columns;
  const isWide = cardWidth >= wideCardWidth * pxPerRem;
  const cardHeight = cardWidth * (isWide ? 9 / 16 : 4 / 3);
  const yearHeight = (yearTitleHeight + yearGap) * pxPerRem + cardHeight;
  const lastListedIndex = getLastListedIndex(years);

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    // None until the width is known.
    count: width > 0 ? years.length : 0,
    getScrollElement: () => scrollRef.current,
    getItemKey: index => years[index].year,
    estimateSize: () => yearHeight,
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    // The list starts below the page's toolbar, which the virtualizer does not count.
    overscan: 2,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [yearHeight, rowVirtualizer]);

  if (years.length === 0) {
    return (
      <div className="m-auto flex flex-col items-center gap-y-2 text-center font-semibold">
        <span>No anime known for any season.</span>
        <span className="opacity-65">Only anime the server has AniDB data for are listed.</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const year = years[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
          >
            <div className="flex h-7 items-center text-lg font-semibold">{year.year}</div>
            <div className="mt-3 grid grid-cols-4 gap-4">
              {getYearSeasons(year, lastListedIndex).map(summary => (
                <SeasonBrowserCard
                  key={summary.key.season}
                  height={cardHeight}
                  isSelected={isSameSeason(summary.key, season)}
                  isWide={isWide}
                  onSelect={() => onSeasonSelect(summary.key)}
                  summary={summary}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeasonBrowser;
