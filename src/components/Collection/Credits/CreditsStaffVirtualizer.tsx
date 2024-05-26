import React from 'react';
import { useOutletContext } from 'react-router';
import { useVirtualizer } from '@tanstack/react-virtual';

import CreditsStaffPanel from '@/components/Collection/Credits/CreditsStaffPanel';

import type { SeriesCast } from '@/core/types/api/series';
import type { CreditsModeType } from '@/pages/collection/series/SeriesCredits';

const StaffPanelVirtualizer = ({ castArray, mode }: { castArray: SeriesCast[], mode: CreditsModeType }) => {
  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();
  const cardSize = { x: 466.5, y: 174, gap: 24 };

  const rowVirtualizer = useVirtualizer({
    count: castArray.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => cardSize.y,
    overscan: 30, // Greater than the norm as lanes aren't taken into account
    lanes: 3,
    gap: cardSize.gap,
  });

  return (
    <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map(virtualRow => (
        <div
          key={virtualRow.key}
          className="absolute top-0"
          style={{
            left: virtualRow.lane * (cardSize.x + cardSize.gap),
            width: cardSize.x,
            height: cardSize.y,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <CreditsStaffPanel cast={castArray[virtualRow.index]} mode={mode} />
        </div>
      ))}
    </div>
  );
};

export default StaffPanelVirtualizer;
