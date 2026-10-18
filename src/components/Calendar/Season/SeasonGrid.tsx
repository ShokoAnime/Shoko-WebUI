import useMeasure from 'react-use-measure';

import SeasonCard from '@/components/Calendar/Season/SeasonCard';
import VirtualRows from '@/components/Calendar/VirtualRows';
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
  const [containerRef, { width }] = useMeasure();

  const columns = 1 + columnThresholds.filter(threshold => width >= threshold * pxPerRem).length;
  const rows = width > 0 ? getSeasonGridRows(sections, columns) : [];

  // The columns decide which row ends a section, so the sizes are measured again when they change.
  return (
    <VirtualRows
      containerRef={containerRef}
      count={rows.length}
      getKey={index => rows[index].key}
      estimateSize={index => getRowHeight(rows[index]) * pxPerRem}
      overscan={3}
      sizeKey={columns}
      renderRow={(index) => {
        const row = rows[index];
        if (row.type === 'title') {
          return (
            <div className="flex items-center gap-x-2 text-lg font-semibold">
              {row.section.Title}
              <span className="text-sm font-normal opacity-65">{row.section.Anime.length}</span>
            </div>
          );
        }
        return (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {row.anime.map(anime => (
              <SeasonCard key={anime.ID} anime={anime} now={now} showCollectionBadge={showCollectionBadge} />
            ))}
          </div>
        );
      }}
    />
  );
};

export default SeasonGrid;
