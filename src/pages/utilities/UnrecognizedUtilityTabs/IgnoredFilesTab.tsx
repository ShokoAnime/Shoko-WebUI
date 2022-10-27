import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiMagnify, mdiRestart,
  mdiPlusCircleOutline, mdiCloseCircleOutline,
} from '@mdi/js';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel, getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import Button from '../../../components/Input/Button';
import Input from '../../../components/Input/Input';
import TransitionDiv from '../../../components/TransitionDiv';
import UtilitiesTable from './Components/UtilitiesTable';

import {
  useGetFileIgnoredQuery,
  usePutFileIgnoreMutation,
} from '../../../core/rtkQuery/fileApi';
import { fuzzyFilter } from '../../../core/util';

import type { FileType } from '../../../core/types/api/file';

type Props = {
  columns: ColumnDef<FileType, any>[];
  show: boolean;
  setFilesCount: (count: number) => void;
};

function IgnoredFilesTab({ columns, show, setFilesCount }: Props) {
  const filesQuery = useGetFileIgnoredQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };

  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();

  const [columnFilters, setColumnFilters] = useState([{ id: 'filename', value: '' }] as Array<{ id: string; value: string }>);

  useEffect(() => {
    if (show) setFilesCount(files.Total);
  }, [show, files.Total]);

  const table = useReactTable({
    data: files.List,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map(row => row.original), [table.getSelectedRowModel()]);

  const restoreFiles = () => {
    forEach(selectedRows, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: false }).catch(() => {});
    });
  };

  const renderOperations = (common = false) => {
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string, highlight = false) => (
      <Button onClick={onClick} className="flex items-center mr-4 font-normal text-font-main">
        <Icon path={icon} size={1} className={cx(['mr-1', highlight && 'text-highlight-1'])} />
        {name}
      </Button>
    );

    return (
      <>
        {renderButton(() => { filesQuery.refetch(); table.resetRowSelection(); }, mdiRestart, 'Refresh')}
        <TransitionDiv className="flex grow" show={!common}>
          {renderButton(() => restoreFiles(), mdiPlusCircleOutline, 'Restore', true)}
          {renderButton(() => table.resetRowSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };

  return (
    <TransitionDiv className="flex flex-col grow absolute h-full w-full" show={show}>

      <div className="flex">
        <Input type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} />
        <div className="box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2">
          {renderOperations(selectedRows.length === 0)}
          <div className="ml-auto text-highlight-2 font-semibold">{selectedRows.length} Files Selected</div>
        </div>
      </div>
      <TransitionDiv className="w-full grow basis-0 mt-4 overflow-y-auto rounded-lg bg-background-nav border border-background-border">
        {files.Total > 0 ? (
          <UtilitiesTable table={table} />
        ) : (
          <div className="flex items-center justify-center h-full font-semibold">No ignored files(s)!</div>
        )}
      </TransitionDiv>

    </TransitionDiv>
  );
}

export default IgnoredFilesTab;
