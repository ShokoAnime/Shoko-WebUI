import { useEffect, useState } from 'react';
import {
  mdiBeta,
  mdiCloseCircleOutline,
  mdiCreation,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiDumpTruck,
  mdiEyeOffOutline,
  mdiFileDocumentEditOutline,
  mdiLinkVariantPlus,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { countBy, every, some } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import DropdownButton from '@/components/Input/DropdownButton';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import TransitionDiv from '@/components/TransitionDiv';
import { getManagedFolderColumn, staticColumns } from '@/components/Utilities/constants';
import ItemCount from '@/components/Utilities/ItemCount';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import AvDumpSeriesSelectModal from '@/components/Utilities/Unrecognized/AvDumpSeriesSelectModal';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useAvdumpFilesMutation } from '@/core/react-query/avdump/mutations';
import {
  useDeleteFilesMutation,
  useIgnoreFileMutation,
  useRehashFileMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { addFiles } from '@/core/slices/utilities/renamer';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';
import { processError } from '@/core/util';
import getEd2kLink from '@/core/utilities/getEd2kLink';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';
import useTableSearchSortCriteria from '@/hooks/utilities/useTableSearchSortCriteria';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { FileSortOrderValue, FileType } from '@/core/types/api/file';
import type { AxiosError } from 'axios';
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

  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { mutate: deleteFiles } = useDeleteFilesMutation();
  const { mutateAsync: ignoreFile } = useIgnoreFileMutation();
  const { mutateAsync: rehashFile } = useRehashFileMutation();
  const { mutateAsync: rescanFile } = useRescanFileMutation();

  // This is for invalidating queries for LinkFilesWithProviders
  useEffect(() => {
    invalidateQueries(['release-info']);
    invalidateQueries(['series', 'anidb']);
    invalidateQueries(['episode', 'anidb']);
  }, []);

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };

  const removeFileFromSelection = (fileId: number) =>
    setSelectedRows((draftState) => {
      draftState[fileId] = false;
      return draftState;
    });

  const handleDelete = () => {
    deleteFiles(
      {
        fileIds: selectedRows.map(row => row.ID),
        removeFolder: true,
      },
      {
        onSuccess: () => toast.success(`${selectedRows.length} files deleted!`),
        onError: () => toast.error('Files could not be deleted!'),
      },
    );
    setSelectedRows([]);
  };

  const ignoreFiles = () => {
    const promises = selectedRows.map(
      row => ignoreFile({ fileId: row.ID, ignore: true }),
    );

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error ignoring ${failedCount} files!`);
        if (failedCount !== selectedRows.length) toast.success(`${selectedRows.length} files ignored!`);
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  const rehashFiles = () => {
    const promises = selectedRows.map(row => rehashFile(row.ID));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Rehash failed for ${failedCount} files!`);
        if (failedCount !== selectedRows.length) toast.success(`Rehashing ${selectedRows.length} files!`);
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  const rescanFiles = () => {
    const promises = selectedRows.map(row => rescanFile(row.ID));

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Rescan failed for ${failedCount} files!`);
        if (failedCount !== selectedRows.length) toast.success(`Rescanning ${selectedRows.length} files!`);
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  const handleRename = () => {
    dispatch(addFiles(selectedRows));
    navigate('/webui/utilities/renamer');
  };

  const renderSelectedRowActions = (
    <>
      <div className="flex 2xl:hidden">
        {selectedRows.length !== 0
          && (
            <MenuButton
              onClick={() => {
                setSelectedRows([]);
                invalidateQueries(['files', { include_only: ['Unrecognized'] }]);
              }}
              icon={mdiRefresh}
              name="Refresh"
            />
          )}
      </div>
      <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
      <MenuButton onClick={rehashFiles} icon={mdiDatabaseSyncOutline} name="Rehash" />
      <MenuButton onClick={handleRename} icon={mdiFileDocumentEditOutline} name="Rename" />
      <MenuButton onClick={ignoreFiles} icon={mdiEyeOffOutline} name="Ignore" />
      <MenuButton
        onClick={() => setShowConfirmModal(true)}
        icon={mdiMinusCircleOutline}
        name="Delete"
        highlightType="danger"
      />
      <MenuButton
        onClick={() => setSelectedRows([])}
        icon={mdiCloseCircleOutline}
        name="Cancel Selection"
        highlightType="primary"
      />
    </>
  );

  return (
    <>
      <div
        className={cx(
          selectedRows.length !== 0 ? 'hidden 3xl:flex' : 'inline-flex',
          'box-border h-13 grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3',
        )}
      >
        <MenuButton
          onClick={() => {
            setSelectedRows([]);
            invalidateQueries(['files', { include_only: ['Unrecognized'] }]);
          }}
          icon={mdiRefresh}
          name="Refresh"
        />
        <TransitionDiv
          className="hidden grow gap-x-2 lg:flex 2xl:gap-x-4"
          show={selectedRows.length !== 0}
        >
          {renderSelectedRowActions}
        </TransitionDiv>
      </div>

      <div className={cx(selectedRows.length !== 0 ? 'flex' : 'hidden', '3xl:hidden')}>
        <DropdownButton buttonType="secondary" content={<span>Options</span>}>
          {renderSelectedRowActions}
        </DropdownButton>
      </div>

      <DeleteFilesModal
        show={showConfirmModal}
        selectedFiles={selectedRows}
        removeFile={removeFileFromSelection}
        onClose={cancelDelete}
        onConfirm={handleDelete}
      />
    </>
  );
};

const UnrecognizedTab = () => {
  const navigate = useNavigateVoid();

  const {
    debouncedSearch,
    search,
    setSearch,
    setSortCriteria,
    sortCriteria,
  } = useTableSearchSortCriteria('ManagedFolderName');
  const [seriesSelectModal, setSeriesSelectModal] = useState(false);

  const { mutateAsync: avdumpFiles } = useAvdumpFilesMutation();

  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [];

  let sortOrder: FileSortOrderValue[] | undefined;
  if (debouncedSearch && sortCriteria) {
    sortOrder = [sortCriteria];
  } else if (sortCriteria) {
    sortOrder = [sortCriteria, 'FileName', 'RelativePath'];
  }

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 200,
      include: ['AbsolutePaths'],
      include_only: ['Unrecognized', 'ImportLimbo'],
      sortOrder,
    },
    debouncedSearch,
  );
  const [files, fileCount] = useFlattenListResult(filesQuery.data);

  const columns: UtilityHeaderType<FileType>[] = [
    getManagedFolderColumn(managedFolders),
    ...staticColumns,
    {
      id: 'status',
      name: 'Status',
      className: 'w-16',
      item: file => <AVDumpFileIcon file={file} />,
    },
  ];

  const avdumpList = useSelector(state => state.utilities.avdump);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(files);

  const isAvdumpFinished = selectedRows.length > 0
    && every(
      selectedRows,
      row => avdumpList.sessions[avdumpList.sessionMap[row.ID]]?.status === 'Success' || row.AVDump.LastDumpedAt,
    );
  const dumpInProgress = selectedRows.length > 0
    && some(
      selectedRows,
      row => avdumpList.sessions[avdumpList.sessionMap[row.ID]]?.status === 'Running',
    );

  const handleAvdumpClick = () => {
    if (isAvdumpFinished && !dumpInProgress) {
      setSeriesSelectModal(true);
    }

    if (!isAvdumpFinished || dumpInProgress) {
      avdumpFiles({
        Priority: true,
        FileIDs: selectedRows
          .filter((row) => {
            const { AVDump } = row;
            return !AVDump?.LastDumpedAt && !AVDump.Status;
          })
          .map(file => file.ID),
      })
        .catch((error: AxiosError) => toast.error('AVDump failed!', processError(error)));
    }
  };

  const fileIds = selectedRows.map(file => file.ID);
  const links = selectedRows.map(file => getEd2kLink(file)).toSorted();

  return (
    <>
      <title>Unrecognized Files | Shoko</title>
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
                className="grow 3xl:grow-0"
                inputClassName="px-4 py-3"
              />
              <Menu
                selectedRows={selectedRows}
                setSelectedRows={setRowSelection}
              />
              <div className={cx('gap-x-3', selectedRows.length !== 0 ? 'flex' : 'hidden')}>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  tooltip="Manual Link (Legacy)"
                  className="flex flex-row flex-wrap items-center gap-x-2 rounded-r-none"
                  onClick={() => navigate('link', { state: { selectedRows } })}
                >
                  <Icon path={mdiLinkVariantPlus} size={1} />
                  <span>Manual Link</span>
                </Button>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  tooltip="Link With Providers (beta)"
                  className="group -ml-3 flex flex-row flex-wrap items-center gap-x-2 rounded-l-none border-l-0"
                  onClick={() => navigate('/webui/utilities/link-with-providers', { state: { selectedRows } })}
                >
                  <div className="relative">
                    <Icon path={mdiCreation} size={1} />
                    <Icon
                      path={mdiBeta}
                      size={0.5}
                      className="absolute -right-1.5 -bottom-1 stroke-button-primary stroke-[8px] transition-[stroke] ease-in-out [paint-order:stroke] group-hover:stroke-button-primary-hover"
                    />
                  </div>
                </Button>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  className="flex min-h-13 flex-row flex-wrap items-center gap-x-2"
                  onClick={handleAvdumpClick}
                  disabled={dumpInProgress}
                >
                  <Icon path={mdiDumpTruck} size={1} />
                  <span>
                    {isAvdumpFinished && !dumpInProgress && 'Finish AVDump'}
                    {!isAvdumpFinished && dumpInProgress && 'Dumping Files...'}
                    {!isAvdumpFinished && !dumpInProgress && 'AVDump Files'}
                  </span>
                </Button>
              </div>
            </div>
          </ShokoPanel>
        </div>

        <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background p-6">
          {filesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!filesQuery.isPending && fileCount === 0 && (
            <div className="flex grow items-center justify-center font-semibold">No unrecognized file(s)!</div>
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
              setRowSelection={setRowSelection}
              setSortCriteria={setSortCriteria}
              sortCriteria={sortCriteria}
            />
          )}
        </div>
      </div>

      <AvDumpSeriesSelectModal
        show={seriesSelectModal}
        onClose={(refresh?: boolean) => {
          if (refresh) setRowSelection({});
          setSeriesSelectModal(false);
        }}
        fileIds={fileIds}
        links={links}
      />
    </>
  );
};

export default UnrecognizedTab;
