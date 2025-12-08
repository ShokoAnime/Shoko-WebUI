import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { mdiLoading, mdiMenuUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce } from 'lodash';

import { criteriaMap } from '@/components/Utilities/constants';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { RootState } from '@/core/store';
import type { EpisodeType } from '@/core/types/api/episode';
import type { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';
import type { VirtualItem } from '@tanstack/react-virtual';
import type { Updater } from 'use-immer';

type Props = {
  columns: UtilityHeaderType<EpisodeType | FileType | SeriesType>[];
  count: number;
  fetchNextPage?: () => Promise<unknown>;
  isFetchingNextPage?: boolean;
  rows: EpisodeType[] | FileType[] | SeriesType[];
  setSortCriteria?: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>;
  skipSort?: boolean;
  sortCriteria?: FileSortCriteriaEnum;
  handleRowSelect?: (id: number, select: boolean) => void;
  rowSelection?: Record<number, boolean>;
  setSelectedRows?: Updater<Record<number, boolean>>;
  fetchNextPreviewPage?: (index?: number) => Promise<unknown>;
  isRenamer?: boolean;
};

const selectRowId = (target: EpisodeType | FileType | SeriesType) => ('ID' in target ? target.ID : target.IDs.ID);

const Row = (
  props: {
    columns: UtilityHeaderType<EpisodeType | FileType | SeriesType>[];
    handleRowSelect: (event: React.MouseEvent, row: VirtualItem) => void;
    row: EpisodeType | FileType | SeriesType;
    selected: boolean;
    virtualRow: VirtualItem;
  },
) => {
  const {
    columns,
    handleRowSelect,
    row,
    selected,
    virtualRow,
  } = props;
  const handleClick = (event: React.MouseEvent) => {
    handleRowSelect(event, virtualRow);
  };

  return (
    <div
      className={cx(
        'relative cursor-pointer rounded-lg border p-4 text-left transition-colors border-panel-border',
        virtualRow.index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
        selected ? 'bg-panel-background-selected-row' : '',
      )}
      onClick={handleClick}
    >
      {!row
        ? <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
        : (
          <div className="flex items-center">
            {columns.map(column => (
              <div className={cx(column.className, 'px-2')} key={`${column.id}-${selectRowId(row)}`}>
                {column.item(row)}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

const isCriteriaMapKey = (type: string): type is keyof typeof criteriaMap => type in criteriaMap;

const HeaderItem = (
  props: {
    className: string;
    id: string;
    name: string;
    setSortCriteria?: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>;
    skipSort?: boolean;
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
    if (skipSort || !isCriteriaMapKey(headerId)) return;
    const criteria = criteriaMap[headerId];
    if (!criteria || !setSortCriteria) return;

    setSortCriteria(prevCriteria => ((prevCriteria === criteria) ? -criteria : criteria));
  };

  const sortIndicator = (headerId: string) => {
    if (skipSort || !isCriteriaMapKey(headerId)) return null;
    const criteria = criteriaMap[headerId];
    if (!criteria || !sortCriteria || Math.abs(sortCriteria) !== criteria as number) return null;

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
    columns,
    count,
    fetchNextPage,
    fetchNextPreviewPage,
    handleRowSelect,
    isFetchingNextPage,
    isRenamer,
    rowSelection,
    rows,
    setSelectedRows,
    setSortCriteria,
    skipSort,
    sortCriteria,
  } = props;
  const renamerPreviews = useSelector((state: RootState) => state.utilities.renamer.renameResults);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () => {
      if (!fetchNextPage) return () => {};
      return debounce(() => {
        fetchNextPage().catch(() => {});
      }, 50);
    },
    [fetchNextPage],
  );

  const fetchPageDebounced = useMemo(
    () => {
      if (!fetchNextPreviewPage) return () => {};
      return debounce((itemIndex: number) => {
        fetchNextPreviewPage(itemIndex).catch(() => {});
      }, 50);
    },
    [fetchNextPreviewPage],
  );

  const lastRowSelected = useRef<VirtualItem | null>(null);
  const handleSelect = (event: React.MouseEvent, virtualRow: VirtualItem) => {
    if (!rowSelection || !handleRowSelect) return;
    try {
      if (setSelectedRows && event.shiftKey) {
        window?.getSelection()?.removeAllRanges();
        const lrIndex = lastRowSelected?.current?.index ?? virtualRow.index;
        const fromIndex = Math.min(lrIndex, virtualRow.index);
        const toIndex = Math.max(lrIndex, virtualRow.index);
        const isSelected = lastRowSelected.current?.index !== undefined
          ? rowSelection[selectRowId(rows[lastRowSelected.current?.index])]
          : true;
        const tempRowSelection: Record<number, boolean> = {};
        for (let index = fromIndex; index <= toIndex; index += 1) {
          const id = selectRowId(rows[index]);
          tempRowSelection[id] = isSelected;
        }
        setSelectedRows(tempRowSelection);
      } else if (window?.getSelection()?.type !== 'Range') {
        const id = selectRowId(rows[virtualRow.index]);
        handleRowSelect(id, !rowSelection[id]);
        lastRowSelected.current = virtualRow;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full grow flex-col overflow-y-auto pr-4" ref={parentRef}>
      <div className="sticky top-0 z-[1] bg-panel-background-alt">
        <div className="flex rounded-lg border border-panel-border bg-panel-table-header p-4 font-semibold">
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
              if (isRenamer && !renamerPreviews[(row as FileType).ID] && !isFetchingNextPage) {
                fetchPageDebounced(virtualRow.index);
              }

              return (
                <div
                  className="mt-1 rounded-lg"
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  <Row
                    columns={columns}
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
