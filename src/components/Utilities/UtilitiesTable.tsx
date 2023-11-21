import React, { useRef } from 'react';
import { mdiMenuUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';

import type { SeriesType } from '@/core/types/api/series';
import type { Row, Table } from '@tanstack/react-table';

type Props = {
  table: Table<FileType> | Table<SeriesType>;
  sortCriteria?: FileSortCriteriaEnum;
  setSortCriteria?: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>;
  skipSort: boolean;
};

const criteriaMap = {
  importfolder: FileSortCriteriaEnum.ImportFolderName,
  filename: FileSortCriteriaEnum.FileName,
  crc32: FileSortCriteriaEnum.CRC32,
  size: FileSortCriteriaEnum.FileSize,
  created: FileSortCriteriaEnum.CreatedAt,
};

const selectRowId = (target: FileType | SeriesType) => ('ID' in target ? target.ID : target.IDs.ID);

function UtilitiesTable(props: Props) {
  const {
    setSortCriteria,
    skipSort,
    sortCriteria,
    table,
  } = props;

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });
  const totalSize = rowVirtualizer.getTotalSize();
  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom = virtualRows.length > 0
    ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
    : 0;

  const lastRowSelected = useRef<Row<FileType | SeriesType> | null>(null);
  const handleRowSelect = (e: React.MouseEvent, row: Row<FileType | SeriesType>) => {
    if (e.shiftKey) {
      window?.getSelection()?.removeAllRanges();
      const lrIndex = lastRowSelected?.current?.index ?? row.index;
      const fromIndex = Math.min(lrIndex, row.index);
      const toIndex = Math.max(lrIndex, row.index);
      const isSelected = lastRowSelected.current?.getIsSelected() ?? true;
      const rowSelection = {};
      for (let i = fromIndex; i <= toIndex; i += 1) {
        const id = selectRowId(rows[i].original);
        rowSelection[id] = isSelected;
      }
      table.setRowSelection(rowSelection);
    } else if (window?.getSelection()?.type !== 'Range') {
      row.toggleSelected();
    }

    lastRowSelected.current = row;
  };

  const handleSortCriteriaChange = (id: string) => {
    const criteria = criteriaMap[id];
    if (skipSort || !criteria || !setSortCriteria) return;

    setSortCriteria((tempCriteria) => {
      if (tempCriteria === criteria) return tempCriteria * -1;
      return criteria;
    });
  };

  const sortIndicator = (id: string) => {
    const criteria = criteriaMap[id];
    if (skipSort || !criteria || !sortCriteria || Math.abs(sortCriteria) !== criteria) return null;

    return (
      <Icon
        path={mdiMenuUp}
        size={1}
        className="ml-2 inline text-panel-text-primary transition-transform"
        rotate={sortCriteria === (criteria * -1) ? 180 : 0}
      />
    );
  };

  return (
    <div className="relative w-full grow overflow-y-auto" ref={tableContainerRef}>
      <table
        className="absolute -top-2 w-full table-fixed border-separate border-spacing-y-2 pr-4 text-left"
        style={{ height: totalSize }}
      >
        <thead className="sticky top-0 z-[1]">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-panel-background-alt">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={cx(
                    'py-4 first:rounded-l-md last:rounded-r-md font-semibold border-panel-border border-y first:border-l last:border-r first:pl-6',
                    header.column.columnDef.meta?.className,
                    !skipSort && header.id !== 'status' && 'cursor-pointer',
                  )}
                  onClick={() => handleSortCriteriaChange(header.id)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  {sortIndicator(header.id)}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<FileType | SeriesType>;
            return (
              <tr
                key={row.id}
                className={cx(
                  virtualRow.index % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
                  'cursor-pointer',
                )}
                onClick={e => handleRowSelect(e, row)}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={cx(
                      'py-4 first:rounded-l-md last:rounded-r-md border-y first:border-l last:border-r first:pl-6 pr-6 transition-colors',
                      row.getIsSelected() ? 'border-panel-text-primary' : 'border-panel-border',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UtilitiesTable;
