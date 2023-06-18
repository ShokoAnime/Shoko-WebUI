import React, { useRef } from 'react';
import { flexRender, Row, Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiMenuUp } from '@mdi/js';

import { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { SeriesType } from '@/core/types/api/series';

type Props = {
  table: Table<FileType> | Table<SeriesType>,
  sortCriteria: FileSortCriteriaEnum,
  setSortCriteria: React.Dispatch<React.SetStateAction<FileSortCriteriaEnum>>,
  skipSort: boolean;
};

const criteriaMap = {
  importfolder: FileSortCriteriaEnum.ImportFolderName,
  filename: FileSortCriteriaEnum.FileName,
  crc32: FileSortCriteriaEnum.CRC32,
  size: FileSortCriteriaEnum.FileSize,
  created: FileSortCriteriaEnum.CreatedAt,
};

function UtilitiesTable(props: Props) {
  const {
    table, skipSort,
    sortCriteria, setSortCriteria,
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
      const rowSelection: any = {};
      for (let i = fromIndex; i <= toIndex; i += 1) {
        rowSelection[i] = lastRowSelected.current?.getIsSelected() ?? true;
      }
      table.setRowSelection(rowSelection);
    } else if (window?.getSelection()?.type !== 'Range') {
      row.toggleSelected();
    }

    lastRowSelected.current = row;
  };

  const handleSortCriteriaChange = (id: string) => {
    const criteria = criteriaMap[id];
    if (skipSort || !criteria) return;

    setSortCriteria((tempCriteria) => {
      if (tempCriteria === criteria) return tempCriteria * -1;
      return criteria;
    });
  };

  const sortIndicator = (id: string) => {
    const criteria = criteriaMap[id];
    if (skipSort || !criteria || Math.abs(sortCriteria) !== criteria) return null;

    return <Icon path={mdiMenuUp} size={1} className="text-highlight-1 inline ml-2 transition-transform" rotate={sortCriteria === (criteria * -1) ? 180 : 0} />;
  };

  return (
    <div className="w-full grow overflow-y-auto relative" ref={tableContainerRef}>
      <table className="table-fixed text-left border-separate border-spacing-y-2 w-full absolute -top-2" style={{ height: totalSize }}>
        <thead className="sticky top-0 z-[1]">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-background">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={cx(
                    'py-4 first:rounded-l-md last:rounded-r-md font-semibold border-background-border border-y first:border-l last:border-r first:pl-6',
                    header.column.columnDef.meta?.className,
                    header.id !== 'status' && !skipSort && 'cursor-pointer',
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
            <td style={{ height: `${paddingTop}px` }} />
          </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<FileType | SeriesType>;
            return (
            // Cannot use even: or odd: for background as it doesn't work properly with virtualizer
              <tr key={row.id} className={cx(parseInt(row.id, 10) % 2 === 0 ? 'bg-background-alt' : 'bg-background', 'cursor-pointer')} onClick={e => handleRowSelect(e, row)}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={cx('py-4 first:rounded-l-md last:rounded-r-md border-y first:border-l last:border-r first:pl-6 pr-6 transition-colors', row.getIsSelected() ? 'border-highlight-1' : 'border-background-border')}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom}px` }} />
          </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UtilitiesTable;
