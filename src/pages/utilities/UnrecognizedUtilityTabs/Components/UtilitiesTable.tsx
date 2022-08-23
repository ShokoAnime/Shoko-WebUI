import React from 'react';
import { flexRender, Table } from '@tanstack/react-table';

import type { FileType } from '../../../../core/types/api/file';
import type { SeriesType } from '../../../../core/types/api/series';

type Props = {
  table: Table<FileType> | Table<SeriesType>,
};

function UtilitiesTable({ table }: Props) {
  return (
    <table className="table-fixed text-left border-separate border-spacing-0 w-full">
      <thead className="sticky top-0">
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
      {table.getRowModel().rows.map(row => (
        <tr key={row.id} className="bg-background-nav group">
          {row.getVisibleCells().map(cell => (
            <td key={cell.id} className="py-3.5 border-background-border border-t group-last:border-b group-last:first:rounded-bl-lg group-last:last:rounded-br-lg">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  );
}

export default UtilitiesTable;
