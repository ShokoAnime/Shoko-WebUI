import React, { useMemo, useState } from 'react';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiLoading, mdiMagnify, mdiRestart } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, find } from 'lodash';
import { useDebounce, useEventCallback } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useIgnoreFileMutation } from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import { useFlattenListResult } from '@/hooks/useFlattenListResult';
import { useRowSelection } from '@/hooks/useRowSelection';
import { staticColumns } from '@/pages/utilities/UnrecognizedUtility';

import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';
import type { Updater } from 'use-immer';

const Menu = (
  props: {
    selectedRows: FileType[];
    setSelectedRows: Updater<Record<number, boolean>>;
  },
) => {
  const {
    selectedRows,
    setSelectedRows,
  } = props;

  const { mutateAsync: ignoreFile } = useIgnoreFileMutation();

  const restoreFiles = useEventCallback(() => {
    const promises = selectedRows.map(
      row => ignoreFile({ fileId: row.ID, ignore: false }),
    );

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error restoring ${failedCount} files!`);
        if (failedCount !== selectedRows.length) toast.success(`${selectedRows.length} files restored!`);
        setSelectedRows([]);
      })
      .catch(console.error);
  });

  return (
    <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length === 0}>
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['files', { include_only: ['Ignored'] }]);
          }}
          icon={mdiRestart}
          name="Refresh"
        />
      </TransitionDiv>
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length !== 0}>
        <MenuButton onClick={() => restoreFiles()} icon={mdiEyeOutline} name="Restore" highlight />
        <MenuButton
          onClick={() => setSelectedRows([])}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
      <span className="ml-auto font-semibold text-panel-text-important">
        {selectedRows.length}
        &nbsp;
      </span>
      {selectedRows.length === 1 ? 'File ' : 'Files '}
      Selected
    </div>
  );
};

function IgnoredFilesTab() {
  const [sortCriteria, setSortCriteria] = useState(FileSortCriteriaEnum.ImportFolderName);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = useMemo(() => importFolderQuery?.data ?? [], [importFolderQuery.data]);

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 50,
      include_only: ['Ignored'],
      sortOrder: debouncedSearch
        ? []
        : [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath],
    },
    debouncedSearch,
  );
  const [files, fileCount] = useFlattenListResult(filesQuery.data);

  const columns = useMemo<UtilityHeaderType<FileType>[]>(
    () => [
      {
        id: 'importFolder',
        name: 'Import Folder',
        className: 'w-40',
        item: file =>
          find(
            importFolders,
            { ID: file?.Locations[0]?.ImportFolderID ?? -1 },
          )?.Name ?? '<Unknown>',
      },
      ...staticColumns,
    ],
    [importFolders],
  );

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<FileType>(files);

  return (
    <div className="flex grow flex-col gap-y-8">
      <div>
        <ShokoPanel title={<Title />} options={<ItemCount count={fileCount} />}>
          <div className="flex items-center gap-x-3">
            <Input
              type="text"
              placeholder="Search..."
              startIcon={mdiMagnify}
              id="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              inputClassName="px-4 py-3"
            />
            <Menu
              selectedRows={selectedRows}
              setSelectedRows={setRowSelection}
            />
          </div>
        </ShokoPanel>
      </div>

      <TransitionDiv className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background p-8">
        {filesQuery.isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!filesQuery.isPending && fileCount === 0 && (
          <div className="flex grow items-center justify-center font-semibold">No ignored file(s)!</div>
        )}

        {filesQuery.isSuccess && fileCount > 0 && (
          <UtilitiesTable
            count={fileCount}
            fetchNextPage={filesQuery.fetchNextPage}
            handleRowSelect={handleRowSelect}
            columns={columns}
            isFetchingNextPage={filesQuery.isFetchingNextPage}
            rows={files}
            rowSelection={rowSelection}
            setSelectedRows={setRowSelection}
            setSortCriteria={setSortCriteria}
            skipSort={!!debouncedSearch}
            sortCriteria={sortCriteria}
          />
        )}
      </TransitionDiv>
    </div>
  );
}

export default IgnoredFilesTab;
