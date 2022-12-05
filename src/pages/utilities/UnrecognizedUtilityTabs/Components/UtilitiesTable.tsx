import React from 'react';
import { flexRender, Row, Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import type { FileType } from '../../../../core/types/api/file';
import type { SeriesType } from '../../../../core/types/api/series';

type Props = {
  table: Table<FileType> | Table<SeriesType>,
};

function UtilitiesTable({ table }: Props) {
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
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className="w-full h-full grow basis-0 overflow-y-auto" ref={tableContainerRef}>
      <table className="table-fixed text-left border-separate border-spacing-0 w-full" style={{ height: totalSize }}>
        <thead className="sticky top-0 z-[1]">
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id} className="bg-background-nav drop-shadow-lg">
            {headerGroup.headers.map(header => (
              <th key={header.id} className={`${header.column.columnDef.meta?.className} py-3.5 first:rounded-tl-lg last:rounded-tr-lg`}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
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
            <tr key={row.id} className="bg-background-nav group">
              {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-3.5 border-background-border border-t group-last:border-b group-last:first:rounded-bl-lg group-last:last:rounded-br-lg">
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
