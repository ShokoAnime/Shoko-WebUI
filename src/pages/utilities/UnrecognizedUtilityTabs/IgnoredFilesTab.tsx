import React, { useEffect, useMemo, useState } from 'react';
import { forEach } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiLoading, mdiMagnify, mdiRestart } from '@mdi/js';
import { getCoreRowModel, getFilteredRowModel, Table, useReactTable } from '@tanstack/react-table';
import { useDebounce } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';

import { useGetFilesQuery, usePutFileIgnoreMutation } from '@/core/rtkQuery/splitV3Api/fileApi';
import { fuzzyFilter } from '@/core/util';

import ShokoPanel from '@/components/Panels/ShokoPanel';
import { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { ListResultType } from '@/core/types/api';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import { useUnrecognizedUtilityContext } from '../UnrecognizedUtility';

const Menu = ({ table, files, refetch }: { table: Table<FileType>, files: ListResultType<FileType[]>, refetch: () => void }) => {
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();

  const tableSelectedRows = table.getSelectedRowModel();
  const selectedRows = useMemo(() => tableSelectedRows.rows.map(row => row.original), [tableSelectedRows]);

  const restoreFiles = (selected = false) => {
    const fileList = selected ? selectedRows : files.List;
    forEach(fileList, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: false }).catch(() => {});
    });
  };

  return (
    <>
      <TransitionDiv className="flex grow absolute gap-x-4" show={selectedRows.length === 0}>
        <MenuButton onClick={() => { table.resetRowSelection(); refetch(); }} icon={mdiRestart} name="Refresh" />
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

  const [sortCriteria, setSortCriteria] = useState(FileSortCriteriaEnum.ImportFolderName);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const filesQuery = useGetFilesQuery({
    pageSize: 0,
    includeIgnored: 'only',
    search: debouncedSearch,
    sortOrder: debouncedSearch ? [] : [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath],
  });
  const files = useMemo(() => filesQuery?.data ?? { Total: 0, List: [] }, [filesQuery]);

  const table = useReactTable({
    data: files.List,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getFilteredRowModel: getFilteredRowModel(),
  });
  const tableSelectedRows = table.getSelectedRowModel();
  const selectedRows = useMemo(() => tableSelectedRows.rows.map(row => row.original), [tableSelectedRows]);

  useEffect(() => {
    table.resetRowSelection();
  }, [files, table]);

  return (
    <div className="flex flex-col grow gap-y-8">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={files.Total} />}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={search} onChange={e => setSearch(e.target.value)} inputClassName="px-4 py-3" />
            <div className="box-border flex grow bg-panel-background-alt-2 border border-panel-border items-center rounded-md px-4 py-3 relative">
              <Menu table={table} files={files} refetch={() => filesQuery.refetch()} />
              <span className="text-panel-important ml-auto">{selectedRows.length}&nbsp;</span>Files Selected
            </div>
          </div>
        </ShokoPanel>
      </div>

      <TransitionDiv className="flex grow overflow-y-auto rounded-md bg-panel-background border border-panel-border p-8">
        {filesQuery.isLoading && (
          <div className="flex grow justify-center items-center text-panel-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}
        {!filesQuery.isLoading && files.Total > 0 && (
          <UtilitiesTable table={table} sortCriteria={sortCriteria} setSortCriteria={setSortCriteria} skipSort={Boolean(debouncedSearch)} />
        )}
        {!filesQuery.isLoading && files.Total === 0 && (
          <div className="flex items-center justify-center grow font-semibold">No ignored file(s)!</div>
        )}
      </TransitionDiv>

    </div>
  );
}

export default IgnoredFilesTab;
