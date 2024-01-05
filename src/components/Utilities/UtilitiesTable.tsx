import React, { useMemo, useRef, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiLoading, mdiMenuUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';
import { useToggle } from 'usehooks-ts';

import useEventCallback from '@/hooks/useEventCallback';
import { criteriaMap } from '@/pages/utilities/UnrecognizedUtility';

import type { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';
import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';
import type { VirtualItem } from '@tanstack/react-virtual';
import type { Updater } from 'use-immer';

type Props = {
  columns: UtilityHeaderType<FileType | SeriesType>[];
  count: number;
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  rows: FileType[] | SeriesType[];
  setSortCriteria?: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>;
  skipSort: boolean;
  sortCriteria?: FileSortCriteriaEnum;
  handleRowSelect?: (id: number, select: boolean) => void;
  rowSelection?: Record<number, boolean>;
  setSelectedRows?: Updater<Record<number, boolean>>;
  ExpandedNode?: React.ComponentType<{ id: number, open: boolean }>;
  onExpand?: (id: number) => Promise<void>;
};

const selectRowId = (target: FileType | SeriesType) => ('ID' in target ? target.ID : target.IDs.ID);

const Row = (
  props: {
    ExpandedNode?: React.ComponentType<{ id: number, open: boolean }>;
    columns: UtilityHeaderType<FileType | SeriesType>[];
    handleRowSelect: (event: React.MouseEvent, row: VirtualItem) => void;
    onExpand?: (id: number) => Promise<void>;
    row: FileType | SeriesType;
    selected: boolean;
    virtualRow: VirtualItem;
  },
) => {
  const {
    ExpandedNode,
    columns: tempColumns,
    handleRowSelect,
    onExpand,
    row,
    selected,
    virtualRow,
  } = props;

  const [open, toggleOpen] = useToggle(false);
  const [loading, setLoading] = useState(false);

  // TODO: Check if ExpandedNode changes reference on every render, if so this useEventCallback is useless
  // If it is useless, so is the useEventCallback for handleSelect in UtilitiesTable
  const handleClick = useEventCallback((event: React.MouseEvent) => {
    if (ExpandedNode) {
      const id = selectRowId(row);
      if (!open && onExpand) {
        setLoading(true);
        onExpand(id)
          .then(() => {
            toggleOpen();
            setLoading(false);
          })
          .catch(console.error);
      } else toggleOpen();
    }
    handleRowSelect(event, virtualRow);
  });

  const columns = useMemo<UtilityHeaderType<FileType | SeriesType>[]>(() => (ExpandedNode
    ? [
      ...tempColumns,
      {
        id: 'arrow',
        name: '',
        className: 'w-10',
        item: () => (
          <Icon
            path={loading ? mdiLoading : mdiChevronDown}
            spin={loading}
            size={1}
            rotate={open ? 180 : 0}
            className="text-panel-text-primary transition-transform"
          />
        ),
      },
    ]
    : tempColumns), [tempColumns, ExpandedNode, loading, open]);

  return (
    <div
      className={cx(
        virtualRow.index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
        'relative cursor-pointer rounded-md border p-4 text-left transition-colors',
        selected ? 'border-panel-text-primary' : 'border-panel-border',
      )}
      onClick={handleClick}
    >
      {!row
        ? <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
        : (
          <>
            <div className="flex">
              {columns.map(column => (
                <div className={cx(column.className, 'px-2')} key={`${column.id}-${selectRowId(row)}`}>
                  {column.item(row)}
                </div>
              ))}
            </div>
            {ExpandedNode && (
              <AnimateHeight
                height={open ? 'auto' : 0}
                onClick={e => e.stopPropagation()}
                className="cursor-default"
              >
                <ExpandedNode id={selectRowId(row)} open={open} />
              </AnimateHeight>
            )}
          </>
        )}
    </div>
  );
};

const isFileSortCriteriaEnum = (type: unknown): type is keyof typeof FileSortCriteriaEnum => typeof type === 'number';

const HeaderItem = (
  props: {
    className: string;
    id: string;
    name: string;
    setSortCriteria?: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>;
    skipSort: boolean;
    sortCriteria?: FileSortCriteriaEnum;
  },
) => {
  const {
    className,
    id,
    name,
    setSortCriteria,
    skipSort,
    sortCriteria,
  } = props;

  if (skipSort) {
    return (
      <div className={cx('px-2', className)}>
        {name}
      </div>
    );
  }

  const handleSortCriteriaChange = (headerId: string) => {
    if (skipSort || !isFileSortCriteriaEnum(criteriaMap[headerId])) return;
    const criteria = criteriaMap[headerId] as FileSortCriteriaEnum;
    if (!criteria || !setSortCriteria) return;

    setSortCriteria((tempCriteria) => {
      if (tempCriteria === criteria) return tempCriteria * -1;
      return criteria;
    });
  };

  const sortIndicator = (headerId: string) => {
    if (skipSort || !isFileSortCriteriaEnum(criteriaMap[headerId])) return null;
    const criteria = criteriaMap[headerId] as number;
    if (!criteria || !sortCriteria || Math.abs(sortCriteria) !== criteria) return null;

    return (
      <Icon
        path={mdiMenuUp}
        size={1}
        className="ml-2 inline text-panel-text-primary transition-transform"
        rotate={sortCriteria as number === (criteria * -1) ? 180 : 0}
      />
    );
  };

  return (
    <div
      className={cx('px-2', className, !skipSort && id !== 'status' && 'cursor-pointer')}
      onClick={() => handleSortCriteriaChange(id)}
    >
      {name}
      {sortIndicator(id)}
    </div>
  );
};

const UtilitiesTable = (props: Props) => {
  const {
    ExpandedNode,
    columns,
    count,
    fetchNextPage,
    handleRowSelect,
    isFetchingNextPage,
    onExpand,
    rowSelection,
    rows,
    setSelectedRows,
    setSortCriteria,
    skipSort,
    sortCriteria,
  } = props;

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 50),
    [fetchNextPage],
  );

  const lastRowSelected = useRef<VirtualItem | null>(null);
  const handleSelect = useEventCallback((event: React.MouseEvent, virtualRow: VirtualItem) => {
    if (!rowSelection || !handleRowSelect || !setSelectedRows) return;
    if (event.shiftKey) {
      window?.getSelection()?.removeAllRanges();
      const lrIndex = lastRowSelected?.current?.index ?? virtualRow.index;
      const fromIndex = Math.min(lrIndex, virtualRow.index);
      const toIndex = Math.max(lrIndex, virtualRow.index);
      const isSelected = lastRowSelected.current?.index !== undefined
        ? rowSelection[selectRowId(rows[lastRowSelected.current?.index])]
        : true;
      const tempRowSelection: Record<number, boolean> = {};
      for (let i = fromIndex; i <= toIndex; i += 1) {
        const id = selectRowId(rows[i]);
        tempRowSelection[id] = isSelected;
      }
      setSelectedRows(tempRowSelection);
    } else if (window?.getSelection()?.type !== 'Range') {
      const id = selectRowId(rows[virtualRow.index]);
      handleRowSelect(id, !rowSelection[id]);
      lastRowSelected.current = virtualRow;
    }
  });

  return (
    <div className="flex w-full flex-col overflow-y-auto px-4" ref={parentRef}>
      <div className="sticky top-0 z-[1] bg-panel-background-alt">
        <div className="flex rounded-md border border-panel-border p-4 font-semibold">
          {columns.map(column => (
            <HeaderItem
              key={column.id}
              id={column.id}
              name={column.name}
              setSortCriteria={setSortCriteria}
              sortCriteria={sortCriteria}
              skipSort={skipSort}
              className={column.className}
            />
          ))}
          {ExpandedNode && (
            <HeaderItem
              key="placeholder"
              className="w-10"
              id="placeholder"
              name=""
              skipSort
            />
          )}
        </div>
      </div>
      <div className="relative grow">
        <div className="absolute top-0 w-full" style={{ height: virtualizer.getTotalSize() }}>
          <div
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
          >
            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index];

              if (!row && !isFetchingNextPage) fetchNextPageDebounced();

              return (
                <div
                  className="mt-2 rounded-md"
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  <Row
                    ExpandedNode={ExpandedNode}
                    columns={columns}
                    onExpand={onExpand}
                    handleRowSelect={handleSelect}
                    row={row}
                    selected={(row && rowSelection) ? rowSelection[selectRowId(row)] : false}
                    virtualRow={virtualRow}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilitiesTable;
