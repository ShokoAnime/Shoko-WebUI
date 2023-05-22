import React, { useMemo } from 'react';
import { Outlet } from 'react-router';
import { NavLink, useOutletContext } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { find, get } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { useGetImportFoldersQuery } from '../../core/rtkQuery/splitV3Api/importFolderApi';

import { fuzzySort } from '../../core/util';
import type { FileType } from '../../core/types/api/file';
import type { ImportFolderType } from '../../core/types/api/import-folder';

type ContextType = {
  columns: ColumnDef<FileType, any>[];
};

const columnHelper = createColumnHelper<FileType>();

const TabButton = ({ id, name }: { id: string; name: string }) => (
  <NavLink to={`../${id}`} className={({ isActive }) => isActive ? 'text-highlight-1' : ''}>
    {name}
  </NavLink>
);

export const Title = () => (
  <div className="flex items-center font-semibold space-x-2">
    Unrecognized Files
    <Icon path={mdiChevronRight} size={1} />
    <TabButton id="files" name="Unrecognized" />
    <div>|</div>
    <TabButton id="manually-linked-files" name="Manually Linked" />
    <div>|</div>
    <TabButton id="ignored-files" name="Ignored Files" />
  </div>
);

function UnrecognizedUtility() {
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const columns = useMemo(() => [
    columnHelper.accessor(row => get(row, 'Locations.0.ImportFolderID', -1), {
      header: 'Import Folder',
      id: 'importfolder',
      cell: info => info.getValue() === -1 ? '<Unknown>' : (find(importFolders, { ID: info.getValue() })?.Name ?? ''),
      meta: {
        className: 'w-52',
      },
    }),
    columnHelper.accessor(row => get(row, 'Locations.0.RelativePath', ''), {
      header: 'Filename',
      id: 'filename',
      cell: info => <div className="break-all">{info.getValue().split(/[\/\\]/g).pop()}</div>,
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
      cell: info => prettyBytes(info.getValue(), { binary: true }),
      meta: {
        className: 'w-32',
      },
    }),
    columnHelper.accessor('Created', {
      cell: info => moment(info.getValue()).format('MMMM DD YYYY, HH:mm'),
      meta: {
        className: 'w-64',
      },
    }),
  ], [importFolders]);

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
