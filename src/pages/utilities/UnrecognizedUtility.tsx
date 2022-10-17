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

import { useGetImportFoldersQuery } from '../../core/rtkQuery/importFolderApi';

import { fuzzySort } from '../../core/util';

import type { FileType } from '../../core/types/api/file';
import type { ImportFolderType } from '../../core/types/api/import-folder';
import ShokoPanel from '../../components/Panels/ShokoPanel';

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedUtility() {
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const [activeTab, setActiveTab] = useState('unrecognized');
  const [filesCount, setFilesCount] = useState(0);

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
    columnHelper.accessor(row => row.Locations?.[0].ImportFolderID ?? -1, {
      header: 'Import Folder',
      id: 'importfolder',
      cell: info => info.getValue() === -1 ? '<Unknown>' : (find(importFolders, { ID: info.getValue() })?.Name ?? ''),
      meta: {
        className: 'w-52',
      },
    }),
    columnHelper.accessor(row => row.Locations?.[0].RelativePath ?? '', {
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
      <UnrecognizedTab columns={columns} show={activeTab === 'unrecognized'} setFilesCount={setFilesCount} />
      <IgnoredFilesTab columns={columns} show={activeTab === 'ignoredFiles'} setFilesCount={setFilesCount} />
    </>
  );

  const renderTitle = () => {
    const renderTabButton = (key: string, name: string) => (
      <div onClick={() => setActiveTab(key)} className={cx(['mx-2 cursor-pointer', activeTab === key && 'text-highlight-1'])}>{name}</div>
    );

    return (
      <div className="flex items-center font-semibold">
        Unrecognized Files
        <Icon path={mdiChevronRight} size={1} className="ml-2" />
        {renderTabButton('unrecognized', 'Unrecognized')}
        <div>|</div>
        {renderTabButton('manuallyLinked', 'Manually Linked')}
        <div>|</div>
        {renderTabButton('ignoredFiles', 'Ignored Files')}
      </div>
    );
  };

  const renderOptions = () => (
    <div className="font-semibold">
      <span className="text-highlight-2">{filesCount}</span> Files
    </div>
  );

  return (
    <ShokoPanel title={renderTitle()} options={renderOptions()}>
      <div className="relative grow">
        {renderTabContent()}
      </div>
    </ShokoPanel>
  );
}

export default UnrecognizedUtility;
