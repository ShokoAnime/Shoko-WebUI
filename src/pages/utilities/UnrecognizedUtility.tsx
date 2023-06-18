import React, { useMemo } from 'react';
import { Outlet } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { find, get } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { useGetImportFoldersQuery } from '@/core/rtkQuery/splitV3Api/importFolderApi';

import { fuzzySort } from '@/core/util';
import type { FileType } from '@/core/types/api/file';
import type { ImportFolderType } from '@/core/types/api/import-folder';

type ContextType = {
  columns: ColumnDef<FileType, any>[];
};

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedUtility() {
  const importFolderQuery = useGetImportFoldersQuery();

  const columns = useMemo(() => {
    const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

    return [
      columnHelper.accessor(row => get(row, 'Locations.0.ImportFolderID', -1), {
        header: 'Import Folder',
        id: 'importfolder',
        cell: info => (info.getValue() === -1 ? '<Unknown>' : (find(importFolders, { ID: info.getValue() })?.Name ?? '')),
        meta: {
          className: 'w-52',
        },
      }),
      columnHelper.accessor(row => get(row, 'Locations.0.RelativePath', ''), {
        header: 'Filename',
        id: 'filename',
        cell: info => <div className="break-all">{info.getValue().split(/[/\\]/g).pop()}</div>,
        meta: {
          className: 'w-auto',
        },
        filterFn: 'fuzzy',
        sortingFn: fuzzySort,
      }),
      columnHelper.accessor('Hashes.CRC32', {
        header: 'CRC32',
        id: 'crc32',
        cell: info => info.getValue(),
        meta: {
          className: 'w-32',
        },
      }),
      columnHelper.accessor('Size', {
        id: 'size',
        cell: info => prettyBytes(info.getValue(), { binary: true }),
        meta: {
          className: 'w-32',
        },
      }),
      columnHelper.accessor('Created', {
        id: 'created',
        cell: info => moment(info.getValue()).format('MMMM DD YYYY, HH:mm'),
        meta: {
          className: 'w-64',
        },
      }),
    ];
  }, [importFolderQuery]);

  return (
    <Outlet
      context={{
        columns,
      }}
    />
  );
}

export function useUnrecognizedUtilityContext() {
  return useOutletContext<ContextType>();
}

export default UnrecognizedUtility;
