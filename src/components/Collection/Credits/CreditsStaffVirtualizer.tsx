import React, { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router';
import useMeasure from 'react-use-measure';
import { useVirtualizer } from '@tanstack/react-virtual';

import CreditsStaffPanel from '@/components/Collection/Credits/CreditsStaffPanel';

import type { SeriesCast } from '@/core/types/api/series';
import type { CreditsModeType } from '@/pages/collection/series/SeriesCredits';

const StaffPanelVirtualizer = ({ castArray, mode }: { castArray: SeriesCast[], mode: CreditsModeType }) => {
  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();
  const [containerRef, { width: containerWidth }] = useMeasure();
  const cardSize = useMemo(() => ({ x: 450, y: 174, gap: 24 }), []);

  // Calculate the number of lanes based on card width
  const minLanes = 1;
  const maxLanes = 3;
  const lanes = Math.max(
    minLanes,
    Math.min(maxLanes, Math.floor((containerWidth || 1) / (cardSize.x + cardSize.gap))),
  );

  // Calculate dynamic card width to fill available space
  const dynamicCardSize = useMemo(() => ({
    ...cardSize,
    x: lanes > 0 ? (containerWidth - (lanes - 1) * cardSize.gap) / lanes : cardSize.x,
  }), [containerWidth, lanes, cardSize]);

  // Dynamic overscan based on lanes
  const overscan = lanes === 1 ? 15 : 30;

  const virtualizerOptions = useMemo(() => ({
    count: castArray.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => dynamicCardSize.y,
    overscan,
    lanes,
    gap: dynamicCardSize.gap,
  }), [castArray.length, scrollRef, dynamicCardSize.y, dynamicCardSize.gap, lanes, overscan]);

  const rowVirtualizer = useVirtualizer(virtualizerOptions);

  useEffect(() => {
    rowVirtualizer.calculateRange();
    rowVirtualizer.measure();
  }, [lanes, containerWidth, rowVirtualizer]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map(virtualRow => (
        <div
          key={virtualRow.key}
          className="absolute top-0"
          style={{
            left: virtualRow.lane * (dynamicCardSize.x + dynamicCardSize.gap),
            width: dynamicCardSize.x,
            height: dynamicCardSize.y,
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
