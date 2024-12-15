import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useMeasure from 'react-use-measure';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiDumpTruck,
  mdiEyeOffOutline,
  mdiFileDocumentEditOutline,
  mdiFileDocumentOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { countBy, every, find, some } from 'lodash';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import DropdownButton from '@/components/Input/DropdownButton';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import ItemCount from '@/components/Utilities/ItemCount';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import AvDumpSeriesSelectModal from '@/components/Utilities/Unrecognized/AvDumpSeriesSelectModal';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { staticColumns } from '@/components/Utilities/constants';
import { useAvdumpFilesMutation } from '@/core/react-query/avdump/mutations';
import {
  useDeleteFilesMutation,
  useIgnoreFileMutation,
  useRehashFileMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { addFiles } from '@/core/slices/utilities/renamer';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import getEd2kLink from '@/core/utilities/getEd2kLink';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';
import useRowSelection from '@/hooks/useRowSelection';
import useTableSearchSortCriteria from '@/hooks/utilities/useTableSearchSortCriteria';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';
import type { Updater } from 'use-immer';

const Menu = (
  props: {
    selectedRows: FileType[];
    setSelectedRows: Updater<Record<number, boolean>>;
    setSeriesSelectModal(this: void, show: boolean): void;
  },
) => {
  const {
    selectedRows,
    setSelectedRows,
    setSeriesSelectModal,
  } = props;

  const dispatch = useDispatch();
  const navigate = useNavigateVoid();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { mutate: deleteFiles } = useDeleteFilesMutation();
  const { mutateAsync: ignoreFile } = useIgnoreFileMutation();
  const { mutateAsync: rehashFile } = useRehashFileMutation();
  const { mutateAsync: rescanFile } = useRescanFileMutation();

  const showDeleteConfirmation = useEventCallback(() => {
    setShowConfirmModal(true);
  });

  const cancelDelete = useEventCallback(() => {
    setShowConfirmModal(false);
  });

  const removeFileFromSelection = useEventCallback(
    (fileId: number) =>
      setSelectedRows((immerState) => {
        immerState[fileId] = false;
        return immerState;
      }),
  );

  const handleDelete = useEventCallback(() => {
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
  });

  const ignoreFiles = useEventCallback(() => {
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
  });

  const rehashFiles = useEventCallback(() => {
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
  });

  const rescanFiles = useEventCallback(() => {
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
  });

  const handleRename = useEventCallback(() => {
    dispatch(addFiles(selectedRows));
    navigate('/webui/utilities/renamer');
  });

  const renderSelectedRowActions = useMemo(() => (
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
      <MenuButton onClick={() => setSeriesSelectModal(true)} icon={mdiFileDocumentOutline} name="Add To AniDB" />
      <MenuButton onClick={handleRename} icon={mdiFileDocumentEditOutline} name="Rename" />
      <MenuButton onClick={ignoreFiles} icon={mdiEyeOffOutline} name="Ignore" />
      <MenuButton onClick={showDeleteConfirmation} icon={mdiMinusCircleOutline} name="Delete" highlight />
      <MenuButton
        onClick={() => setSelectedRows([])}
        icon={mdiCloseCircleOutline}
        name="Cancel Selection"
        highlight
      />
    </>
  ), [
    handleRename,
    ignoreFiles,
    rehashFiles,
    rescanFiles,
    setSelectedRows,
    setSeriesSelectModal,
    showDeleteConfirmation,
    selectedRows,
  ]);

  return (
    <>
      <div
        className={cx(
          selectedRows.length !== 0 ? 'hidden 3xl:flex' : 'inline-flex',
          'box-border h-[3.25rem] grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 gap-x-4',
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
        <DropdownButton buttonTypes="secondary" content={<span>Options</span>}>
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

function UnrecognizedTab() {
  const navigate = useNavigateVoid();

  const {
    debouncedSearch,
    search,
    setSearch,
    setSortCriteria,
    sortCriteria,
  } = useTableSearchSortCriteria(FileSortCriteriaEnum.ImportFolderName);
  const [seriesSelectModal, setSeriesSelectModal] = useState(false);

  const { mutate: avdumpFiles } = useAvdumpFilesMutation();

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = useMemo(() => importFolderQuery?.data ?? [], [importFolderQuery.data]);

  const sortOrder = useMemo(() => {
    if (!sortCriteria) return undefined;
    if (debouncedSearch) return [sortCriteria];
    return [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath];
  }, [debouncedSearch, sortCriteria]);

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 200,
      include_only: ['Unrecognized'],
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
        item: (file) => {
          const importFolder = find(
            importFolders,
            { ID: file?.Locations[0]?.ImportFolderID ?? -1 },
          )?.Name ?? '<Unknown>';

          return (
            <div
              className="truncate"
              data-tooltip-id="tooltip"
              data-tooltip-content={importFolder}
              data-tooltip-delay-show={500}
            >
              {importFolder}
            </div>
          );
        },
      },
      ...staticColumns,
      {
        id: 'status',
        name: 'Status',
        className: 'w-16',
        item: file => <AVDumpFileIcon file={file} />,
      },
    ],
    [importFolders],
  );

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<FileType>(files);

  const isAvdumpFinished = useMemo(
    () => (selectedRows.length > 0
      ? every(
        selectedRows,
        row => avdumpList.sessions[avdumpList.sessionMap[row.ID]]?.status === 'Success' || row.AVDump.LastDumpedAt,
      )
      : false),
    [selectedRows, avdumpList],
  );
  const dumpInProgress = some(avdumpList.sessions, session => session.status === 'Running');

  const handleAvdumpClick = useEventCallback(() => {
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
      });
    }
  });

  const getED2KLinks = useEventCallback(() => ({
    fileIds: selectedRows.map(file => file.ID),
    links: selectedRows.map(
      file => getEd2kLink(file),
    ).toSorted(),
  }));

  const [tabContainerRef, bounds] = useMeasure();
  const isOverlay = bounds.width <= 1365 && bounds.width >= 1206 && selectedRows.length !== 0;

  const searchClassName = useMemo(() => {
    if (bounds.width < 1547 && selectedRows.length !== 0) {
      if (isAvdumpFinished && !dumpInProgress) {
        return '!w-[calc(100vw-652px)]';
      }
      if (!isAvdumpFinished && dumpInProgress) {
        return '!w-[calc(100vw-656px)]';
      }
      if (!isAvdumpFinished && !dumpInProgress) {
        return '!w-[calc(100vw-640px)]';
      }
    }
    if (isOverlay) return '!w-[calc(100vw-38.4rem)]';
    return '';
  }, [bounds.width, selectedRows.length, isOverlay, isAvdumpFinished, dumpInProgress]);

  return (
    <>
      <title>Unrecognized Files | Shoko</title>
      <div className="flex grow flex-col gap-y-6" ref={tabContainerRef}>
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
                inputClassName={cx('px-4 py-3', searchClassName)}
                overlayClassName="grow 2xl:w-auto 2xl:grow-0"
              />
              <Menu
                selectedRows={selectedRows}
                setSelectedRows={setRowSelection}
                setSeriesSelectModal={setSeriesSelectModal}
              />
              <div className={cx('gap-x-3', selectedRows.length !== 0 ? 'flex' : 'hidden')}>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  className="flex flex-row flex-wrap items-center gap-x-2"
                  onClick={() => navigate('link', { state: { selectedRows } })}
                >
                  <Icon path={mdiOpenInNew} size={1} />
                  <span>Manual Link</span>
                </Button>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  className="flex h-13 flex-row flex-wrap items-center gap-x-2"
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

        <div className="flex grow overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
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
              setSelectedRows={setRowSelection}
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
        getLinks={getED2KLinks}
      />
    </>
  );
}

export default UnrecognizedTab;
