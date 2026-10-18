import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { useVirtualizer } from '@tanstack/react-virtual';

import SeasonCard from '@/components/AiringSchedule/SeasonCard';
import { pxPerRem } from '@/core/util';
import { getSeasonGridRows } from '@/core/utilities/airingSchedule';

import type { SeasonSectionType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';
import type { SeasonGridRowType } from '@/core/utilities/airingSchedule';

type Props = {
  now: Dayjs;
  sections: SeasonSectionType[];
  showCollectionBadge: boolean;
};

// One column, and one more from each of these widths, so a card beside another is never much narrower than 27rem.
const columnThresholds = [56, 84];

// The rows have fixed heights, in rem: a section's title with the space below it, a row of cards with the space below
// it, which is larger after a section's last row.
const titleHeight = 2.5;
const cardHeight = 16;
const rowGap = 1;
const sectionGap = 1.5;

const getRowHeight = (
  row: SeasonGridRowType,
) => (row.type === 'title' ? titleHeight : cardHeight + (row.isSectionEnd ? sectionGap : rowGap));

const SeasonGrid = ({ now, sections, showCollectionBadge }: Props) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  const [containerRef, { width }] = useMeasure();

  const columns = 1 + columnThresholds.filter(threshold => width >= threshold * pxPerRem).length;
  const rows = width > 0 ? getSeasonGridRows(sections, columns) : [];

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: index => rows[index].key,
    estimateSize: index => getRowHeight(rows[index]) * pxPerRem,
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    // The list starts below the page's toolbar, which the virtualizer does not count.
    overscan: 3,
  });

  // The columns decide which row ends a section, so the sizes are measured again when they change.
  useEffect(() => {
    rowVirtualizer.measure();
  }, [columns, rowVirtualizer]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
          >
            {row.type === 'title'
              ? (
                <div className="flex items-center gap-x-2 text-lg font-semibold">
                  {row.section.Title}
                  <span className="text-sm font-normal opacity-65">{row.section.Anime.length}</span>
                </div>
              )
              : (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                  {row.anime.map(anime => (
                    <SeasonCard key={anime.ID} anime={anime} now={now} showCollectionBadge={showCollectionBadge} />
                  ))}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default SeasonGrid;
