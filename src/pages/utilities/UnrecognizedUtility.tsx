import React, { useMemo, useState } from 'react';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import cx from 'classnames';
import { find } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { createColumnHelper } from '@tanstack/react-table';

import Checkbox from '../../components/Input/Checkbox';
import UnrecognizedTab from './UnrecognizedUtilityTabs/UnrecognizedTab';
import IgnoredFilesTab from './UnrecognizedUtilityTabs/IgnoredFilesTab';

import { useGetFileUnrecognizedQuery } from '../../core/rtkQuery/fileApi';
import { useGetImportFoldersQuery } from '../../core/rtkQuery/importFolderApi';

import { fuzzySort } from '../../core/util';

import type { FileType } from '../../core/types/api/file';
import type { ImportFolderType } from '../../core/types/api/import-folder';

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedUtility() {
  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const [activeTab, setActiveTab] = useState('unrecognized');

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'checkbox',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox id="checkbox-all" isChecked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()} intermediate={table.getIsSomeRowsSelected()}/>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox id={`checkbox-${row.id}`} isChecked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}/>
        </div>
      ),
      meta: {
        className: 'w-20',
      },
    }),
    columnHelper.accessor(row => row.Locations[0].ImportFolderID, {
      header: 'Import Folder',
      id: 'importfolder',
      cell: info => (find(importFolders, { ID: info.getValue() })?.Name ?? ''),
      meta: {
        className: 'w-52',
      },
    }),
    columnHelper.accessor(row => row.Locations[0].RelativePath, {
      header: 'Filename',
      id: 'filename',
      cell: info => info.getValue(),
      meta: {
        className: 'w-auto',
      },
      filterFn: 'fuzzy',
      sortingFn: fuzzySort,
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
        className: 'w-56',
      },
    }),
  ], []);


  const renderTabContent = () => (
    <>
      <UnrecognizedTab columns={columns} show={activeTab === 'unrecognized'} />
      <IgnoredFilesTab columns={columns} show={activeTab === 'ignoredFiles'} />
    </>
  );

  const renderTabButton = (key: string, name: string) => (
    <div onClick={() => setActiveTab(key)} className={cx(['mx-2 cursor-pointer', activeTab === key && 'text-highlight-1'])}>{name}</div>
  );

  return (
    <React.Fragment>

      <div className="flex items-center font-semibold">
        Unrecognized Files
        <Icon path={mdiChevronRight} size={1} className="ml-2" />
        {renderTabButton('unrecognized', 'Unrecognized')}
        <div>|</div>
        {renderTabButton('manuallyLinked', 'Manually Linked')}
        <div>|</div>
        {renderTabButton('ignoredFiles', 'Ignored Files')}
        <div className="ml-auto">
          <span className="text-highlight-2">{files.Total}</span> Files
        </div>
      </div>

      <div className="bg-background-border my-4 h-0.5 flex-shrink-0" />

      <div className="flex h-full relative">
        {renderTabContent()}
      </div>

    </React.Fragment>
  );
}

export default UnrecognizedUtility;
