import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useMeasure from 'react-use-measure';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiDumpTruck,
  mdiEyeOffOutline,
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
import { useDebounce } from 'usehooks-ts';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import ButtonDropdown from '@/components/Input/ButtonDropdown';
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
import {
  useAvdumpFileMutation,
  useDeleteFileMutation,
  useIgnoreFileMutation,
  useRehashFileMutation,
  useRescanFileMutation,
} from '@/core/react-query/file/mutations';
import { useFilesInfiniteQuery } from '@/core/react-query/file/queries';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { FileSortCriteriaEnum } from '@/core/types/api/file';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useRowSelection from '@/hooks/useRowSelection';
import { staticColumns } from '@/pages/utilities/UnrecognizedUtility';

import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';
import type { UtilityHeaderType } from '@/pages/utilities/UnrecognizedUtility';
import type { Updater } from 'use-immer';

const Menu = (
  props: {
    selectedRows: FileType[];
    setSelectedRows: Updater<Record<number, boolean>>;
    setSeriesSelectModal(this: void, show: boolean): void;
    isShow?: boolean;
  },
) => {
  const {
    isShow,
    selectedRows,
    setSelectedRows,
    setSeriesSelectModal,
  } = props;

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { mutateAsync: deleteFile } = useDeleteFileMutation();
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

  const deleteFiles = useEventCallback(() => {
    const promises = selectedRows.map(
      row => deleteFile({ fileId: row.ID, removeFolder: true }),
    );

    Promise
      .allSettled(promises)
      .then((result) => {
        const failedCount = countBy(result, 'status').rejected;
        if (failedCount) toast.error(`Error deleting ${failedCount} files!`);
        if (failedCount !== selectedRows.length) toast.success(`${selectedRows.length} files deleted!`);
        setSelectedRows([]);
      })
      .catch(console.error);
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

  const selectedOptionStyles = useMemo(() => {
    if (selectedRows.length === 0) return 'hidden';
    if (isShow) return 'flex xl:hidden';
    return 'flex';
  }, [selectedRows, isShow]);

  const renderSelectedRowActions = useMemo(() => (
    <>
      <MenuButton onClick={rescanFiles} icon={mdiDatabaseSearchOutline} name="Rescan" />
      <MenuButton onClick={rehashFiles} icon={mdiDatabaseSyncOutline} name="Rehash" />
      <MenuButton onClick={() => setSeriesSelectModal(true)} icon={mdiFileDocumentOutline} name="Add To AniDB" />
      <MenuButton onClick={ignoreFiles} icon={mdiEyeOffOutline} name="Ignore" />
      <MenuButton onClick={showDeleteConfirmation} icon={mdiMinusCircleOutline} name="Delete" highlight />
      <MenuButton
        onClick={() => setSelectedRows([])}
        icon={mdiCloseCircleOutline}
        name="Cancel Selection"
        highlight
      />
    </>
  ), [ignoreFiles, rehashFiles, rescanFiles, setSelectedRows, setSeriesSelectModal, showDeleteConfirmation]);

  return (
    <>
      <div
        className={cx(
          isShow || selectedRows.length === 0 ? 'hidden xl:flex' : 'hidden 2xl:flex',
          'box-border h-[3rem] grow items-center rounded-md border border-panel-border bg-panel-background-alt px-4 py-3',
        )}
      >
        <TransitionDiv className="flex grow gap-x-2 2xl:gap-x-4" show={selectedRows.length === 0}>
          <MenuButton
            onClick={() => {
              setSelectedRows([]);
              invalidateQueries(['files', { include_only: ['Unrecognized'] }]);
            }}
            icon={mdiRefresh}
            name="Refresh"
          />
        </TransitionDiv>
        <TransitionDiv className="hidden grow gap-x-2 lg:flex 2xl:gap-x-4" show={selectedRows.length !== 0 && isShow}>
          {renderSelectedRowActions}
        </TransitionDiv>
      </div>

      <Button
        buttonType="secondary"
        onClick={() => {
          setSelectedRows([]);
          invalidateQueries(['files', { include_only: ['Unrecognized'] }]);
        }}
        className={cx(selectedRows.length !== 0 ? 'hidden' : 'flex', 'p-3 xl:hidden')}
      >
        <Icon path={mdiRefresh} size={1} />
        <span>Refresh</span>
      </Button>

      <div className={cx(selectedOptionStyles, '2xl:hidden')}>
        <ButtonDropdown className="p-3" buttonTypes="secondary" content={<span>Options</span>}>
          {renderSelectedRowActions}
        </ButtonDropdown>
      </div>

      <DeleteFilesModal
        show={showConfirmModal}
        selectedFiles={selectedRows}
        removeFile={removeFileFromSelection}
        onClose={cancelDelete}
        onConfirm={deleteFiles}
      />
    </>
  );
};

function UnrecognizedTab() {
  const navigate = useNavigate();

  const [seriesSelectModal, setSeriesSelectModal] = useState(false);
  const [sortCriteria, setSortCriteria] = useState(FileSortCriteriaEnum.ImportFolderName);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 200);
  const { mutate: avdumpFile } = useAvdumpFileMutation();

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = useMemo(() => importFolderQuery?.data ?? [], [importFolderQuery.data]);

  const filesQuery = useFilesInfiniteQuery(
    {
      pageSize: 50,
      include_only: ['Unrecognized'],
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
    } else {
      selectedRows.forEach(row => !row?.AVDump?.LastDumpedAt && !row?.AVDump.Status && avdumpFile(row.ID));
    }
  });

  const getED2KLinks = useEventCallback(() => ({
    fileIds: selectedRows.map(file => file.ID),
    links: selectedRows.map(
      file =>
        `ed2k://|file|${
          file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''
        }|${file.Size}|${file.Hashes.ED2K}|/`,
    ),
  }));

  const [tabContainerRef, bounds] = useMeasure();
  const isOverlay = useMemo(
    () => bounds.width <= 1462 && bounds.width >= 1206 && selectedRows.length !== 0,
    [bounds.width, selectedRows.length],
  );

  const searchClassName = useMemo(() => {
    if (bounds.width < 1206) {
      if (selectedRows.length === 0) return '!w-[calc(100vw-20rem)]';
      return '!w-[calc(100vw-40rem)]';
    }
    if (isOverlay) return '!w-[calc(100vw-40rem)]';
    return '';
  }, [selectedRows.length, bounds, isOverlay]);

  return (
    <>
      <div className="flex grow flex-col gap-y-8" ref={tabContainerRef}>
        <div>
          <ShokoPanel title={<Title />} options={<ItemCount count={fileCount} selected={selectedRows?.length} />}>
            <div className="flex items-center gap-x-3">
              <Input
                type="text"
                placeholder="Search..."
                startIcon={mdiMagnify}
                id="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                inputClassName={cx('px-4 py-3', searchClassName)}
                isOverlay={isOverlay}
                overlayClassName="grow 2xl:w-auto 2xl:grow-0"
                onToggleOverlay={show => setIsSearching(_ => show)}
              />
              <Menu
                selectedRows={selectedRows}
                setSelectedRows={setRowSelection}
                setSeriesSelectModal={setSeriesSelectModal}
                isShow={!isSearching}
              />
              <div className={cx('h-[50px] gap-x-3', selectedRows.length !== 0 ? 'flex' : 'hidden')}>
                <Button
                  buttonType="primary"
                  className="flex flex-row flex-wrap items-center px-4 py-3"
                  onClick={() => navigate('link', { state: { selectedRows } })}
                >
                  <Icon path={mdiOpenInNew} size={0.8333} />
                  <span>Manual Link</span>
                </Button>
                <Button
                  buttonType="primary"
                  className="flex flex-row flex-wrap items-center px-4 py-3"
                  onClick={handleAvdumpClick}
                  disabled={dumpInProgress}
                >
                  <Icon path={mdiDumpTruck} size={0.8333} />
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

        <div className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background px-4 py-8">
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
              skipSort={!!debouncedSearch}
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
