import useMeasure from 'react-use-measure';
import cx from 'classnames';

import { PaneMessage } from '@/components/AiringSchedule/PaneState';
import VirtualRows from '@/components/AiringSchedule/VirtualRows';
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
  const [containerRef, { width }] = useMeasure();

  // The cards keep their frame's shape, so a year's height follows from the width.
  const cardWidth = (width - (columns - 1) * cardGap * pxPerRem) / columns;
  const isWide = cardWidth >= wideCardWidth * pxPerRem;
  const cardHeight = cardWidth * (isWide ? 9 / 16 : 4 / 3);
  const yearHeight = (yearTitleHeight + yearGap) * pxPerRem + cardHeight;
  const lastListedIndex = getLastListedIndex(years);

  if (years.length === 0) {
    return (
      <PaneMessage title="No anime known for any season.">
        Only anime the server has AniDB data for are listed.
      </PaneMessage>
    );
  }

  return (
    <VirtualRows
      containerRef={containerRef}
      // None until the width is known.
      count={width > 0 ? years.length : 0}
      getKey={index => years[index].year}
      estimateSize={() => yearHeight}
      overscan={2}
      sizeKey={yearHeight}
      renderRow={(index) => {
        const year = years[index];
        return (
          <>
            <div className="flex h-7 items-center text-lg font-semibold">{year.year}</div>
            <div
              className="mt-3 grid"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${cardGap}rem` }}
            >
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
          </>
        );
      }}
    />
  );
};

export default SeasonBrowser;
