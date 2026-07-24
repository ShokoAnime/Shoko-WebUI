import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiLoading, mdiMagnify, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useToggle } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { fileNameColumn, getManagedFolderColumn } from '@/components/Utilities/constants';
import DuplicateFilesModal from '@/components/Utilities/DuplicateFiles/DuplicateFilesModal';
import Title from '@/components/Utilities/DuplicateFiles/Title';
import ItemCount from '@/components/Utilities/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { resetQueries } from '@/core/react-query/queryClient';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useTableSearchSortCriteria from '@/hooks/utilities/useTableSearchSortCriteria';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { FileType } from '@/core/types/api/file';

const DuplicateFilesUnrecognizedTab = () => {
  const [selectedFile, setSelectedFile] = useState(-1);
  const [showModal, toggleModal, setShowModal] = useToggle(false);

  const { debouncedSearch, search, setSearch, setSortCriteria, sortCriteria } = useTableSearchSortCriteria(
    FileSortCriteriaEnum.DuplicateCount,
  );

  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [];

  let sortOrder: FileSortCriteriaEnum[] | undefined;
  if (debouncedSearch && sortCriteria) {
    sortOrder = [sortCriteria];
  } else if (sortCriteria) {
    sortOrder = [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath];
  }

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 100,
      include: ['AbsolutePaths'],
      include_only: ['Duplicates', 'Unrecognized'],
      sortOrder,
    },
    debouncedSearch,
  );
  const [files, fileCount] = useFlattenListResult(filesQuery.data);

  const columns: UtilityHeaderType<FileType>[] = [
    getManagedFolderColumn(managedFolders),
    fileNameColumn,
    {
      id: 'duplicate-count',
      name: 'Duplicate Count',
      className: 'w-40',
      item: (file) => {
        const count = file.Locations.filter(loc => !!loc.AbsolutePath).length - 1;
        return (
          <>
            <span className="text-panel-text-important">{count}</span>
            {count === 1 ? ' Duplicate' : ' Duplicates'}
          </>
        );
      },
    },
  ];

  const handleRowSelect = (fileId: number) => {
    const idx = files.findIndex(file => file.ID === fileId);
    if (idx !== -1) {
      setSelectedFile(idx);
      setShowModal(true);
    }
  };

  const handleFileChange = (type: 'previous' | 'next') => {
    setSelectedFile((prev) => {
      const newIdx = prev + (type === 'previous' ? -1 : 1);
      if (newIdx < 0) return prev;
      if (newIdx >= files.length && filesQuery.hasNextPage) {
        filesQuery.fetchNextPage().then(() => {
          setSelectedFile(newIdx);
        }).catch(console.error);
        return prev;
      }
      if (newIdx < fileCount) return newIdx;
      return prev;
    });
  };

  const file = files[selectedFile];

  const handleRefresh = () => {
    if (filesQuery.isFetching) return;
    resetQueries(['files']);
  };

  useHotkeys('r', handleRefresh, { scopes: 'primary' });

  return (
    <>
      <title>Duplicate Files | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <ShokoPanel title={<Title />} options={<ItemCount count={fileCount} suffix="Files" />}>
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
            <div className="relative box-border flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-3">
              <MenuButton
                onClick={handleRefresh}
                icon={mdiRefresh}
                name="Refresh"
                loading={filesQuery.isFetching}
                keybinding="R"
              />
            </div>
          </div>
        </ShokoPanel>

        <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
          {filesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!filesQuery.isPending && fileCount === 0 && (
            <div className="flex grow items-center justify-center font-semibold">
              No unrecognized duplicate file(s)!
            </div>
          )}

          {filesQuery.isSuccess && fileCount > 0 && (
            <UtilitiesTable
              count={fileCount}
              fetchNextPage={() => filesQuery.fetchNextPage()}
              handleRowSelect={handleRowSelect}
              columns={columns}
              isFetchingNextPage={filesQuery.isFetchingNextPage}
              rows={files}
              setSortCriteria={setSortCriteria}
              sortCriteria={sortCriteria}
              rowSelection={{}}
            />
          )}
        </div>
      </div>

      <DuplicateFilesModal
        show={showModal}
        onClose={toggleModal}
        files={file ? [file] : []}
        count={fileCount}
        index={selectedFile}
        onChange={handleFileChange}
        isFetching={filesQuery.isFetchingNextPage}
      />
    </>
  );
};

export default DuplicateFilesUnrecognizedTab;
