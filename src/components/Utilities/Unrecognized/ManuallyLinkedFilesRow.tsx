import React, { useCallback, useEffect, useMemo } from 'react';
import { find } from 'lodash';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import Checkbox from '@/components/Input/Checkbox';
import { fuzzyFilter, fuzzySort } from '@/core/util';

import type { FileType } from '@/core/types/api/file';
import { EpisodeType } from '@/core/types/api/episode';
import { Icon } from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

type Props = {
  seriesId: number;
  updateSelectedFiles: (fileIds: number[], select?: boolean) => void;
  selectedFiles: { [key: number]: boolean };
  files: FileType[];
  episodes: EpisodeType[];
};

const columnHelper = createColumnHelper<FileType>();

function ManuallyLinkedFilesRow(props: Props) {
  const { seriesId, updateSelectedFiles, selectedFiles, episodes, files } = props;

  const getEpTypePrefix = useCallback(
    (epType: string) => {
      switch (epType) {
        case 'Normal': return 'EP';
        case 'Special': return 'SP';
        case 'ThemeSong': return 'C';
        default: return '';
      }
    },
    [],
  );

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'checkbox',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            id={`checkbox-${seriesId}-all`}
            isChecked={table.getIsAllRowsSelected()}
            onChange={() => {
              const selectedIds: Array<number> = [];
              table.getRowModel().flatRows.reduce((result, row) => {
                result.push(row.original.ID);
                return result;
              }, selectedIds);
              updateSelectedFiles(selectedIds, !table.getIsAllRowsSelected());
              table.toggleAllRowsSelected();
            }}
            intermediate={table.getIsSomeRowsSelected()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            id={`checkbox-${seriesId}-${row.id}`}
            isChecked={row.getIsSelected()}
            onChange={() => {
              updateSelectedFiles([row.original.ID], !row.getIsSelected());
              row.toggleSelected();
            }}
          />
        </div>
      ),
      meta: {
        className: 'w-20',
      },
    }),
    columnHelper.display({
      id: 'entry',
      header: 'Entry',
      cell: ({ row }) => {
        const episode = find(episodes, item => item.IDs.ID === row.original.SeriesIDs![0].EpisodeIDs[0].ID)!;
        return (
          <div className="flex">
            {`${getEpTypePrefix(episode?.AniDB?.Type ?? '')} ${episode?.AniDB?.EpisodeNumber} - ${episode?.Name}`}&nbsp;
            (<span className="text-highlight-1 font-semibold">{episode?.IDs?.AniDB}</span>)
            <a href={`https://anidb.net/episode/${episode?.IDs?.AniDB}`} rel="noopener noreferrer" target="_blank" className="text-highlight-1 ml-2">
              <Icon path={mdiOpenInNew} size={1} />
            </a>
          </div>
        );
      },
      meta: {
        className: 'w-auto',
      },
    }),
    columnHelper.accessor(row => row.Locations?.[0].RelativePath.split(/[/\\]/g).pop(), {
      header: 'File',
      id: 'file',
      cell: info => info.getValue(),
      meta: {
        className: 'w-128',
      },
      filterFn: 'fuzzy',
      sortingFn: fuzzySort,
    }),
  ], [episodes]);

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  useEffect(() => {
    table.getRowModel().flatRows.forEach((row) => {
      if (selectedFiles[row.original.ID]) row.toggleSelected(selectedFiles[row.original.ID]);
    });
  }, [selectedFiles, table.getRowModel()]);

  return (
    <table className="table-fixed text-left border-separate border-spacing-0 w-full">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} className={`${header.column.columnDef.meta?.className} pt-4 pb-1.5`}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="py-1.5">
                <span className="line-clamp-1 break-all">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ManuallyLinkedFilesRow;
