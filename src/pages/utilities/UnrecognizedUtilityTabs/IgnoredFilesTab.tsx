import React, { useEffect, useMemo, useState } from 'react';
import { forEach } from 'lodash';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiMagnify, mdiRestart } from '@mdi/js';
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, Table, useReactTable } from '@tanstack/react-table';
import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';

import { useGetFileIgnoredQuery, usePutFileIgnoreMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import { fuzzyFilter } from '@/core/util';

import { useUnrecognizedUtilityContext } from '../UnrecognizedUtility';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { FileType } from '@/core/types/api/file';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';

const Menu = ({ table }: { table: Table<FileType> }) => {
  const filesQuery = useGetFileIgnoredQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();

  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map(row => row.original), [table.getSelectedRowModel().rows.length]);

  const restoreFiles = (selected = false) => {
    const fileList = selected ? selectedRows : files.List;
    forEach(fileList, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: false }).catch(() => {});
    });
  };

  return (
    <>
      <TransitionDiv className="flex grow absolute gap-x-4" show={selectedRows.length === 0}>
        <MenuButton onClick={async () => { table.resetRowSelection(); await filesQuery.refetch(); }} icon={mdiRestart} name="Refresh" />
        <MenuButton onClick={restoreFiles} icon={mdiEyeOutline} name="Restore All" />
      </TransitionDiv>
      <TransitionDiv className="flex grow absolute gap-x-4" show={selectedRows.length !== 0}>
        <MenuButton onClick={() => restoreFiles(true)} icon={mdiEyeOutline} name="Restore All" highlight />
        <MenuButton onClick={table.resetRowSelection} icon={mdiCloseCircleOutline} name="Cancel Selection" highlight />
      </TransitionDiv>
    </>
  );
};

function IgnoredFilesTab() {
  const { columns } = useUnrecognizedUtilityContext();

  const filesQuery = useGetFileIgnoredQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };

  const [columnFilters, setColumnFilters] = useState([{ id: 'filename', value: '' }] as Array<{ id: string; value: string }>);

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
  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map(row => row.original), [table.getSelectedRowModel().rows.length]);

  useEffect(() => {
    table.resetRowSelection();
  }, [files.List]);

  return (
    <div className="flex flex-col grow gap-y-8">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={files.Total} />}>
          <div className="flex items-center gap-x-3">
            {/*TODO: Fix search bar height*/}
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} />
            <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
              <Menu table={table} />
              <span className="text-highlight-2 ml-auto">{selectedRows.length}&nbsp;</span>Files Selected
            </div>
          </div>
        </ShokoPanel>
      </div>

        <TransitionDiv className="flex grow overflow-y-auto rounded-md bg-background-alt border border-background-border p-8">
        {files.Total > 0 ? (
          <UtilitiesTable table={table} />
        ) : (
          <div className="flex items-center justify-center grow font-semibold">No ignored file(s)!</div>
        )}
      </TransitionDiv>

    </div>
  );
}

export default IgnoredFilesTab;
