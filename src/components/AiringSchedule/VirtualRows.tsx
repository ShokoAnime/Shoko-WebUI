import { useEffect } from 'react';
import type { ReactNode, Ref, RefObject } from 'react';
import { useOutletContext } from 'react-router';
import { useVirtualizer } from '@tanstack/react-virtual';

type Props = {
  containerRef?: Ref<HTMLDivElement>;
  count: number;
  estimateSize: (index: number) => number;
  getKey: (index: number) => string | number;
  overscan: number;
  renderRow: (index: number) => ReactNode;
  /** The sizes are measured again when this changes. */
  sizeKey?: unknown;
};

/** Rows of fixed heights as a virtual list on the main page's scroll container. */
const VirtualRows = ({ containerRef, count, estimateSize, getKey, overscan, renderRow, sizeKey }: Props) => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    getItemKey: getKey,
    estimateSize,
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    // The list starts below the page's toolbar, which the virtualizer does not count.
    overscan,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, sizeKey]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map(virtualRow => (
        <div
          key={virtualRow.key}
          className="absolute top-0 left-0 w-full"
          style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
        >
          {renderRow(virtualRow.index)}
        </div>
      ))}
    </div>
  );
};

export default VirtualRows;
