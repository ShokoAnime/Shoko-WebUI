import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { every, forEach, some } from 'lodash';
import { useDebounce, useEventCallback } from 'usehooks-ts';

import DeleteFilesModal from '@/components/Dialogs/DeleteFilesModal';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import AVDumpFileIcon from '@/components/Utilities/Unrecognized/AvDumpFileIcon';
import AvDumpSeriesSelectModal from '@/components/Utilities/Unrecognized/AvDumpSeriesSelectModal';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import Title from '@/components/Utilities/Unrecognized/Title';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import {
  useDeleteFileMutation,
  useGetFilesQuery,
  usePostFileAVDumpMutation,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
  usePutFileIgnoreMutation,
} from '@/core/rtkQuery/splitV3Api/fileApi';
import { FileSortCriteriaEnum, type FileType } from '@/core/types/api/file';
import { fuzzyFilter } from '@/core/util';
import { useUnrecognizedUtilityContext } from '@/pages/utilities/UnrecognizedUtility';

import type { RootState } from '@/core/store';
import type { ListResultType } from '@/core/types/api';
import type { Table } from '@tanstack/react-table';

const columnHelper = createColumnHelper<FileType>();

const Menu = (
  props: {
    files: ListResultType<FileType[]>;
    table: Table<FileType>;
    refetch(): void;
    setSeriesSelectModal(show: boolean): void;
  },
) => {
  const {
    files,
    refetch,
    setSeriesSelectModal,
    table,
  } = props;

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [fileDeleteTrigger] = useDeleteFileMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileRescanTrigger] = usePostFileRescanMutation();

  const tableSelectedRows = table.getSelectedRowModel();
  const selectedRows = useMemo(() => tableSelectedRows.rows.map(row => row.original), [tableSelectedRows]);

  const showDeleteConfirmation = useEventCallback(() => {
    setShowConfirmModal(true);
  });

  const cancelDelete = useEventCallback(() => {
    setShowConfirmModal(false);
  });

  const removeFileFromSelection = useEventCallback(
    (fileId: number) => tableSelectedRows.rows.find(row => row.original.ID === fileId)?.toggleSelected(false),
  );

  const deleteFiles = useEventCallback(() => {
    table.resetRowSelection();
    let failedFiles = 0;
    forEach(selectedRows, (row) => {
      fileDeleteTrigger({ fileId: row.ID, removeFolder: true }).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error deleting ${failedFiles} files!`);
    if (failedFiles !== selectedRows.length) toast.success(`${selectedRows.length} files deleted!`);
  });

  const ignoreFiles = useEventCallback(() => {
    let failedFiles = 0;
    forEach(selectedRows, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: true }).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error ignoring ${failedFiles} files!`);
    if (failedFiles !== selectedRows.length) toast.success(`${selectedRows.length} files ignored!`);
  });

  const rehashFiles = useEventCallback((selected = false) => {
    let failedFiles = 0;
    const fileList = selected ? selectedRows : files.List;

    forEach(fileList, (file) => {
      fileRehashTrigger(file.ID).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rehash failed for ${failedFiles} files!`);
    if (failedFiles !== fileList.length) toast.success(`Rehashing ${fileList.length} files!`);
  });

  const rescanFiles = useEventCallback((selected = false) => {
    let failedFiles = 0;
    const fileList = selected ? selectedRows : files.List;

    forEach(fileList, (file) => {
      fileRescanTrigger(file.ID).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Rescan failed for ${failedFiles} files!`);
    if (failedFiles !== fileList.length) toast.success(`Rescanning ${fileList.length} files!`);
  });

  return (
    <div className="relative box-border flex grow items-center rounded-md border border-panel-border bg-panel-background-toolbar px-4 py-3">
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length === 0}>
        <MenuButton
          onClick={() => {
            table.resetRowSelection();
            refetch();
          }}
          icon={mdiRefresh}
          name="Refresh List"
        />
        <MenuButton onClick={() => rescanFiles()} icon={mdiDatabaseSearchOutline} name="Rescan All" />
        <MenuButton onClick={() => rehashFiles()} icon={mdiDatabaseSyncOutline} name="Rehash All" />
        <MenuButton
          onClick={() => setSeriesSelectModal(true)}
          icon={mdiFileDocumentOutline}
          name="Copy All ED2K Hashes"
        />
      </TransitionDiv>
      <TransitionDiv className="absolute flex grow gap-x-4" show={selectedRows.length !== 0}>
        <MenuButton onClick={() => rescanFiles(true)} icon={mdiDatabaseSearchOutline} name="Rescan" />
        <MenuButton onClick={() => rehashFiles(true)} icon={mdiDatabaseSyncOutline} name="Rehash" />
        <MenuButton onClick={() => setSeriesSelectModal(true)} icon={mdiFileDocumentOutline} name="Copy ED2K Hash" />
        <MenuButton onClick={ignoreFiles} icon={mdiEyeOffOutline} name="Ignore" />
        <MenuButton onClick={showDeleteConfirmation} icon={mdiMinusCircleOutline} name="Delete" highlight />
        <MenuButton
          onClick={() => table.resetRowSelection()}
          icon={mdiCloseCircleOutline}
          name="Cancel Selection"
          highlight
        />
      </TransitionDiv>
      <span className="ml-auto font-semibold text-panel-important">
        {selectedRows.length}
        &nbsp;
      </span>
      Files Selected
      <DeleteFilesModal
        show={showConfirmModal}
        selectedFiles={selectedRows}
        removeFile={removeFileFromSelection}
        onClose={cancelDelete}
        onConfirm={deleteFiles}
      />
    </div>
  );
};

function UnrecognizedTab() {
  const navigate = useNavigate();

  const { columns: staticColumns } = useUnrecognizedUtilityContext();
  const columns = useMemo(() => [
    ...staticColumns,
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: info => <AVDumpFileIcon file={info.row.original} />,
      meta: {
        className: 'w-20',
      },
    }),
  ], [staticColumns]);
  const [seriesSelectModal, setSeriesSelectModal] = useState(false);
  const [sortCriteria, setSortCriteria] = useState(FileSortCriteriaEnum.ImportFolderName);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const filesQuery = useGetFilesQuery({
    pageSize: 0,
    includeUnrecognized: 'only',
    search: debouncedSearch,
    sortOrder: debouncedSearch ? [] : [sortCriteria, FileSortCriteriaEnum.FileName, FileSortCriteriaEnum.RelativePath],
  });
  const files = useMemo(() => filesQuery?.data ?? { Total: 0, List: [] }, [filesQuery]);
  const [fileAvdumpTrigger] = usePostFileAVDumpMutation();

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

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
  const isAvdumpFinished = useMemo(() => every(selectedRows, row => row.AVDump.LastDumpedAt), [selectedRows]);
  const dumpInProgress = some(avdumpList.sessions, session => session.status === 'Running');

  const handleAvdumpClick = useEventCallback(async () => {
    if (isAvdumpFinished && !dumpInProgress) {
      setSeriesSelectModal(true);
    } else {
      forEach(
        selectedRows,
        row => !row?.AVDump?.LastDumpedAt && !row.AVDump.Status && fileAvdumpTrigger(row.ID).catch(console.error),
      );
    }
  });

  const getED2KLinks = useEventCallback(() => {
    const fileList = selectedRows.length > 0 ? selectedRows : files.List;
    return fileList.map(
      file =>
        `ed2k://|file|${
          file.Locations[0]?.RelativePath?.split(/[\\/]+/g).pop() ?? ''
        }|${file.Size}|${file.Hashes.ED2K}|/`,
    );
  });

  return (
    <>
      <div className="flex grow flex-col gap-y-8">
        <div>
          <ShokoPanel title={<Title />} options={<ItemCount filesCount={files.Total} />}>
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
                table={table}
                files={files}
                refetch={() => filesQuery.refetch()}
                setSeriesSelectModal={setSeriesSelectModal}
              />
              <TransitionDiv show={selectedRows.length !== 0} className="flex gap-x-3">
                <Button
                  buttonType="primary"
                  className="flex gap-x-2.5 px-4 py-3 font-semibold"
                  onClick={() => navigate('link', { state: { selectedRows } })}
                >
                  <Icon path={mdiOpenInNew} size={0.8333} />
                  Manual Link
                </Button>
                <Button
                  buttonType="primary"
                  className="flex gap-x-2.5 px-4 py-3 font-semibold"
                  onClick={handleAvdumpClick}
                  disabled={dumpInProgress}
                >
                  <Icon path={mdiDumpTruck} size={0.8333} />
                  {isAvdumpFinished && 'Finish AVDump'}
                  {!isAvdumpFinished && dumpInProgress && 'Dumping Files...'}
                  {!isAvdumpFinished && !dumpInProgress && 'AVDump Files'}
                </Button>
              </TransitionDiv>
            </div>
          </ShokoPanel>
        </div>

        <TransitionDiv className="flex grow overflow-y-auto rounded-md border border-panel-border bg-panel-background p-8">
          {filesQuery.isLoading && (
            <div className="flex grow items-center justify-center text-panel-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}
          {!filesQuery.isLoading && files.Total > 0 && (
            <UtilitiesTable
              table={table}
              sortCriteria={sortCriteria}
              setSortCriteria={setSortCriteria}
              skipSort={Boolean(debouncedSearch)}
            />
          )}
          {!filesQuery.isLoading && files.Total === 0 && (
            <div className="flex grow items-center justify-center font-semibold">No unrecognized file(s)!</div>
          )}
        </TransitionDiv>
      </div>

      <AvDumpSeriesSelectModal
        show={seriesSelectModal}
        onClose={() => setSeriesSelectModal(false)}
        getLinks={getED2KLinks}
      />
    </>
  );
}

export default UnrecognizedTab;
