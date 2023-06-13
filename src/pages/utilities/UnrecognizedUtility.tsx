import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { find, get } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { useGetImportFoldersQuery } from '@/core/rtkQuery/splitV3Api/importFolderApi';

import { fuzzySort } from '@/core/util';
import { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { ImportFolderType } from '@/core/types/api/import-folder';
import { Icon } from '@mdi/react';
import { mdiArrowDown, mdiArrowUp } from '@mdi/js';

type ContextType = {
  columns: ColumnDef<FileType, any>[];
  sortCriteria: FileSortCriteriaEnum;
};

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedUtility() {
  const importFolderQuery = useGetImportFoldersQuery();

  const [sortCriteria, setSortCriteria] = useState(FileSortCriteriaEnum.ImportFolderName);

  const columns = useMemo(() => {
    const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

    const handleSortCriteriaChange = (criteria: FileSortCriteriaEnum) => {
      setSortCriteria((tempCriteria) => {
        if (tempCriteria === criteria) return tempCriteria * -1;
        return criteria;
      });
    };

    const sortIndicator = (criteria: FileSortCriteriaEnum) => {
      if (sortCriteria === criteria) return <Icon path={mdiArrowUp} size={1} className="text-highlight-1" />;
      if (sortCriteria === (criteria * -1)) return <Icon path={mdiArrowDown} size={1} className="text-highlight-1" />;
      return null;
    };

    return [
      columnHelper.accessor(row => get(row, 'Locations.0.ImportFolderID', -1), {
        header: () => (
          <div onClick={() => handleSortCriteriaChange(FileSortCriteriaEnum.ImportFolderName)} className="flex gap-x-2 cursor-pointer items-center">
            Import Folder
            {sortIndicator(FileSortCriteriaEnum.ImportFolderName)}
          </div>
        ),
        id: 'importfolder',
        cell: info => (info.getValue() === -1 ? '<Unknown>' : (find(importFolders, { ID: info.getValue() })?.Name ?? '')),
        meta: {
          className: 'w-52',
        },
      }),
      columnHelper.accessor(row => get(row, 'Locations.0.RelativePath', ''), {
        header: () => (
          <div onClick={() => handleSortCriteriaChange(FileSortCriteriaEnum.FileName)} className="flex gap-x-2 cursor-pointer items-center">
            Filename
            {sortIndicator(FileSortCriteriaEnum.FileName)}
          </div>
        ),
        id: 'filename',
        cell: info => <div className="break-all">{info.getValue().split(/[/\\]/g).pop()}</div>,
        meta: {
          className: 'w-auto',
        },
        filterFn: 'fuzzy',
        sortingFn: fuzzySort,
      }),
      columnHelper.accessor('Hashes.CRC32', {
        header: () => (
          <div onClick={() => handleSortCriteriaChange(FileSortCriteriaEnum.CRC32)} className="flex gap-x-2 cursor-pointer items-center">
            CRC32
            {sortIndicator(FileSortCriteriaEnum.CRC32)}
          </div>
        ),
        id: 'crc32',
        cell: info => info.getValue(),
        meta: {
          className: 'w-32',
        },
      }),
      columnHelper.accessor('Size', {
        header: () => (
          <div onClick={() => handleSortCriteriaChange(FileSortCriteriaEnum.FileSize)} className="flex gap-x-2 cursor-pointer items-center">
            Size
            {sortIndicator(FileSortCriteriaEnum.FileSize)}
          </div>
        ),
        cell: info => prettyBytes(info.getValue(), { binary: true }),
        meta: {
          className: 'w-32',
        },
      }),
      columnHelper.accessor('Created', {
        header: () => (
          <div onClick={() => handleSortCriteriaChange(FileSortCriteriaEnum.CreatedAt)} className="flex gap-x-2 cursor-pointer items-center">
            Created
            {sortIndicator(FileSortCriteriaEnum.CreatedAt)}
          </div>
        ),
        cell: info => moment(info.getValue()).format('MMMM DD YYYY, HH:mm'),
        meta: {
          className: 'w-64',
        },
      }),
    ];
  }, [importFolderQuery, sortCriteria]);

  return (
    <Outlet
      context={{
        columns,
        sortCriteria,
      }}
    />
  );
}

export function useUnrecognizedUtilityContext() {
  return useOutletContext<ContextType>();
}

export default UnrecognizedUtility;
