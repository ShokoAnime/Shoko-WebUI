import React, { useEffect, useMemo } from 'react';
import { find } from 'lodash';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';

import Checkbox from '../../../../components/Input/Checkbox';
import { fuzzyFilter, fuzzySort } from '../../../../core/util';

import type { FileType } from '../../../../core/types/api/file';
import { useGetSeriesEpisodesQuery, useGetSeriesFilesQuery } from '../../../../core/rtkQuery/splitV3Api/seriesApi';

type Props = {
  seriesId: number;
  modifySelectedFiles: (fileIds: Array<number>, remove: boolean) => void;
  selectedFiles: Set<number>;
};

const columnHelper = createColumnHelper<FileType>();

function ManuallyLinkedFilesRow(props: Props) {
  const { seriesId, modifySelectedFiles, selectedFiles } = props;
  const filesQuery = useGetSeriesFilesQuery({ seriesId, isManuallyLinked: true, includeXRefs: true }, { refetchOnMountOrArgChange: false });
  const files = filesQuery.data ?? [];

  // We can either get the data for *all* the episodes in the series or call the api 1000 times. Choose your poison, I choose the former. Blame @revam
  const episodesQuery = useGetSeriesEpisodesQuery({ seriesID: seriesId }, { refetchOnMountOrArgChange: false });
  const episodes = episodesQuery?.data?.List ?? [];

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
              modifySelectedFiles(selectedIds, table.getIsAllRowsSelected());
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
              modifySelectedFiles([row.original.ID], row.getIsSelected());
              row.toggleSelected();
            }}
          />
        </div>
      ),
      meta: {
        className: 'w-20',
      },
    }),
    columnHelper.accessor(row => row.Locations?.[0].RelativePath.split(/[\/\\]/g).pop(), {
      header: 'File',
      id: 'file',
      cell: info => info.getValue(),
      meta: {
        className: 'w-auto',
      },
      filterFn: 'fuzzy',
      sortingFn: fuzzySort,
    }),
    columnHelper.display({
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const episode = find(episodes, item => item.IDs.ID === row.original.SeriesIDs![0].EpisodeIDs[0].ID);
        return episode ? episode.AniDB?.Type ?? 'Normal' : <Icon path={mdiLoading} size={1} className="text-highlight-1" spin />;
      },
      meta: {
        className: 'w-36',
      },
    }),
    columnHelper.display({
      id: 'episode',
      header: 'Episode',
      cell: ({ row }) => {
        const episode = find(episodes, item => item.IDs.ID === row.original.SeriesIDs![0].EpisodeIDs[0].ID);
        return episode ? `${episode.AniDB?.EpisodeNumber ?? 'x'} - ${episode.Name}` : <Icon path={mdiLoading} size={1} className="text-highlight-1" spin />;
      },
      meta: {
        className: 'w-96',
      },
    }),
    columnHelper.display({
      id: 'blank',
      cell: '',
      meta: {
        className: 'w-8',
      },
    }),
  ], [episodes]);

  const table = useReactTable({
    data: files,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  useEffect(() => {
    table.getRowModel().flatRows.forEach(row => row.toggleSelected(selectedFiles.has(row.original.ID)));
  }, [selectedFiles, table.getRowModel()]);

  return filesQuery.isLoading ? (
      <div className="flex justify-center py-4">
        <Icon path={mdiLoading} size={1} className="text-highlight-1" spin />
      </div>
  ) : (
    <table className="table-fixed text-left border-separate border-spacing-0 w-full">
      <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} className="bg-background-alt">
          {headerGroup.headers.map(header => (
            <th key={header.id} className={`${header.column.columnDef.meta?.className} py-3.5`}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
      </thead>
      <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id} className="bg-background-alt">
          {row.getVisibleCells().map(cell => (
            <td key={cell.id} className="py-3.5">
              <span className="line-clamp-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
            </td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
    // </div>
  );
}

export default ManuallyLinkedFilesRow;