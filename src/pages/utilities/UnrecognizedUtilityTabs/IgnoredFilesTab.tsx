import React, { useMemo } from 'react';
import { mdiCloseCircleOutline, mdiEyeOutline, mdiLoading, mdiMagnify, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy, find } from 'lodash';

import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { staticColumns } from '@/components/Utilities/constants';
import { useIgnoreFileMutation } from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';
import useTableSearchSortCriteria from '@/hooks/utilities/useTableSearchSortCriteria';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
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

  const restoreFiles = () => {
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
  };

  return (
    <div className="relative box-border flex h-13 grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 ">
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length === 0}>
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['files', { include_only: ['Ignored'] }]);
          }}
          icon={mdiRefresh}
          name="Refresh"
        />
      </TransitionDiv>
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length !== 0}>
        <MenuButton onClick={restoreFiles} icon={mdiEyeOutline} name="Restore" highlight />
        <MenuButton
          onClick={() => setSelectedRows([])}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
    </div>
  );
};

const IgnoredFilesTab = () => {
  const {
    debouncedSearch,
    search,
    setSearch,
    setSortCriteria,
    sortCriteria,
  } = useTableSearchSortCriteria(FileSortCriteriaEnum.ImportFolderName);

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = useMemo(() => importFolderQuery?.data ?? [], [importFolderQuery.data]);

  const sortOrder = useMemo(() => {
    if (!sortCriteria) return undefined;
    if (debouncedSearch) return [sortCriteria];
    return [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath];
  }, [debouncedSearch, sortCriteria]);

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 50,
      include_only: ['Ignored'],
      sortOrder,
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
    <>
      <title>Ignored Files | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <div>
          <ShokoPanel title={<Title />} options={<ItemCount count={fileCount} selected={selectedRows?.length} />}>
            <div className="flex items-center gap-x-3">
              <Input
                type="text"
                placeholder="Search..."
                startIcon={mdiMagnify}
                id="search"
                value={search}
                onChange={setSearch}
                inputClassName="px-4 py-3"
              />
              <Menu
                selectedRows={selectedRows}
                setSelectedRows={setRowSelection}
              />
            </div>
          </ShokoPanel>
        </div>

        <TransitionDiv className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background p-6">
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
              sortCriteria={sortCriteria}
            />
          )}
        </TransitionDiv>
      </div>
    </>
  );
};

export default IgnoredFilesTab;
