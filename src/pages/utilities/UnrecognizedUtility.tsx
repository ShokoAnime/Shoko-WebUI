import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { push } from '@lagunovsky/redux-react-router';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import cx from 'classnames';
import { find } from 'lodash';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { useGetImportFoldersQuery } from '../../core/rtkQuery/splitV3Api/importFolderApi';

import { fuzzySort } from '../../core/util';

import ShokoPanel from '../../components/Panels/ShokoPanel';
import Checkbox from '../../components/Input/Checkbox';
import type { RootState } from '../../core/store';
import type { FileType } from '../../core/types/api/file';
import type { ImportFolderType } from '../../core/types/api/import-folder';

type ContextType = {
  columns: ColumnDef<FileType, any>[];
  setFilesCount: (fileCount: number) => void;
};

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedUtility() {
  const dispatch = useDispatch();
  const pathname = useSelector((state: RootState) => state.router.location.pathname);

  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

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

  const renderTitle = () => {
    const renderTabButton = (key: string, name: string) => (
      <div onClick={() => dispatch(push(key))} className={cx(['mx-2 cursor-pointer', pathname === `/webui/utilities/unrecognized/${key}` && 'text-highlight-1'])}>{name}</div>
    );

    return (
      <div className="flex items-center font-semibold">
        Unrecognized Files
        <Icon path={mdiChevronRight} size={1} className="ml-2" />
        {renderTabButton('files', 'Unrecognized')}
        <div>|</div>
        {renderTabButton('manually-linked-files', 'Manually Linked')}
        <div>|</div>
        {renderTabButton('ignored-files', 'Ignored Files')}
      </div>
    );
  };

  const renderOptions = () => (
    <div className="font-semibold">
      <span className="text-highlight-2">{filesCount}</span> {pathname === '/webui/utilities/unrecognized/manually-linked-files' ? 'Series' : 'Files'}
    </div>
  );

  return (
    <ShokoPanel title={renderTitle()} options={renderOptions()}>
      <Outlet
        context={{
          columns,
          setFilesCount,
        }}
      />
    </ShokoPanel>
  );
}

export function useUnrecognizedUtilityContext() {
  return useOutletContext<ContextType>();
}

export default UnrecognizedUtility;
