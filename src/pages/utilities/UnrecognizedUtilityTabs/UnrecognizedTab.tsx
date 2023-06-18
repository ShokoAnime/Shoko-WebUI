import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiCloseCircleOutline,
  mdiDatabaseSearchOutline,
  mdiDatabaseSyncOutline,
  mdiDumpTruck,
  mdiEyeOffOutline,
  mdiFileDocumentAlertOutline,
  mdiFileDocumentCheckOutline,
  mdiFileDocumentOutline,
  mdiInformationOutline,
  mdiLoading,
  mdiMagnify,
  mdiMinusCircleOutline,
  mdiOpenInNew,
  mdiRefresh,
} from '@mdi/js';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'usehooks-ts';

import toast from '@/components/Toast';
import { fuzzyFilter } from '@/core/util';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';

import {
  useDeleteFileMutation, useGetFilesQuery,
  useLazyPostFileAVDumpQuery,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
  usePutFileIgnoreMutation,
} from '@/core/rtkQuery/splitV3Api/fileApi';
import { setItem as setAvdumpItem } from '@/core/slices/utilities/avdump';

import { FileSortCriteriaEnum, FileType } from '@/core/types/api/file';
import type { ListResultType } from '@/core/types/api';
import type { RootState } from '@/core/store';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import Input from '@/components/Input/Input';
import ItemCount from '@/components/Utilities/Unrecognized/ItemCount';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import AvDumpSeriesSelectModal from '@/components/Utilities/Unrecognized/AvDumpSeriesSelectModal';
import Title from '@/components/Utilities/Unrecognized/Title';
import { useUnrecognizedUtilityContext } from '../UnrecognizedUtility';

const columnHelper = createColumnHelper<FileType>();

const Menu = ({ table, files, refetch }: { table: Table<FileType>, files: ListResultType<FileType[]>, refetch: () => void }) => {
  const [fileDeleteTrigger] = useDeleteFileMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileRescanTrigger] = usePostFileRescanMutation();

  const [seriesSelectModal, setSeriesSelectModal] = useState(false);

  const tableSelectedRows = table.getSelectedRowModel();
  const selectedRows = useMemo(() => tableSelectedRows.rows.map(row => row.original), [tableSelectedRows]);

  const deleteFiles = () => {
    let failedFiles = 0;
    forEach(selectedRows, (row) => {
      fileDeleteTrigger({ fileId: row.ID, removeFolder: true }).catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error deleting ${failedFiles} files!`);
    if (failedFiles !== selectedRows.length) toast.success(`${selectedRows.length} files deleted!`);
  };

  const ignoreFiles = () => {
    let failedFiles = 0;
    forEach(selectedRows, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: true }).unwrap().catch((error) => {
        failedFiles += 1;
        console.error(error);
      });
    });

    if (failedFiles) toast.error(`Error ignoring ${failedFiles} files!`);
    if (failedFiles !== selectedRows.length) toast.success(`${selectedRows.length} files ignored!`);
  };

  const rehashFiles = (selected = false) => {
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
  };

  const rescanFiles = (selected = false) => {
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
  };

  const ed2kLinks = () => {
    const fileList = selectedRows.length > 0 ? selectedRows : files.List;
    return fileList.map(file => `ed2k://|file|${file.Locations[0]?.RelativePath}|${file.Size}|${file.Hashes.ED2K}|/`);
  };

  return (
    <>
      <div className="box-border flex grow bg-background border border-background-border items-center rounded-md px-4 py-3 relative">
        <TransitionDiv className="flex grow absolute gap-x-4" show={selectedRows.length === 0}>
          <MenuButton onClick={() => { table.resetRowSelection(); refetch(); }} icon={mdiRefresh} name="Refresh List" />
          <MenuButton onClick={() => rescanFiles()} icon={mdiDatabaseSearchOutline} name="Rescan All" />
          <MenuButton onClick={() => rehashFiles()} icon={mdiDatabaseSyncOutline} name="Rehash All" />
          <MenuButton onClick={() => setSeriesSelectModal(true)} icon={mdiFileDocumentOutline} name="Copy All ED2K Hashes" />
        </TransitionDiv>
        <TransitionDiv className="flex grow absolute gap-x-4" show={selectedRows.length !== 0}>
          <MenuButton onClick={() => rescanFiles(true)} icon={mdiDatabaseSearchOutline} name="Rescan" />
          <MenuButton onClick={() => rehashFiles(true)} icon={mdiDatabaseSyncOutline} name="Rehash" />
          <MenuButton onClick={() => setSeriesSelectModal(true)} icon={mdiFileDocumentOutline} name="Copy ED2K Hash" />
          <MenuButton onClick={ignoreFiles} icon={mdiEyeOffOutline} name="Ignore" />
          <MenuButton onClick={deleteFiles} icon={mdiMinusCircleOutline} name="Delete" highlight />
          <MenuButton onClick={() => table.resetRowSelection()} icon={mdiCloseCircleOutline} name="Cancel Selection" highlight />
        </TransitionDiv>
        <span className="text-highlight-2 font-semibold ml-auto">{selectedRows.length}&nbsp;</span>Files Selected
      </div>
      <AvDumpSeriesSelectModal show={seriesSelectModal} onClose={() => setSeriesSelectModal(false)} links={ed2kLinks()} />
    </>
  );
};

function UnrecognizedTab() {
  const navigate = useNavigate();

  const { columns: tempColumns } = useUnrecognizedUtilityContext();

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
  const [fileAvdumpTrigger] = useLazyPostFileAVDumpQuery();

  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

  const dispatch = useDispatch();

  const [dumpInProgress, setDumpInProgress] = useState(false);

  const runAvdump = async (fileId: number) => {
    setDumpInProgress(true);
    dispatch(setAvdumpItem({ id: fileId, hash: '', fetching: true }));
    const result = await fileAvdumpTrigger(fileId);
    dispatch(setAvdumpItem({ id: fileId, hash: result.data?.Ed2k ?? 'x', fetching: false }));
    setDumpInProgress(false);
  };

  const columns = [
    ...tempColumns,
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const fileId = info.row.original.ID;

        const handleClick = async (state: string) => {
          if (dumpInProgress || state === 'dumping') return;
          await runAvdump(fileId);
        };

        let icon = {
          path: mdiInformationOutline,
          color: 'text-font-main',
          title: 'Not Dumped!',
          state: 'idle',
        };

        if (avdumpList[fileId]?.fetching) {
          icon = {
            path: mdiLoading,
            color: 'text-highlight-1',
            title: 'Dumping!',
            state: 'dumping',
          };
        } else if (avdumpList[fileId]?.hash === 'x') {
          icon = {
            path: mdiFileDocumentAlertOutline,
            color: 'text-highlight-3',
            title: 'Dump Failed!',
            state: 'failed',
          };
        } else if (avdumpList[fileId]?.hash) {
          icon = {
            path: mdiFileDocumentCheckOutline,
            color: 'text-highlight-2',
            title: 'Dumped Successfully!',
            state: 'success',
          };
        }

        return (
          <div className="flex ml-4">
            {icon.state === 'success' ? (
              <CopyToClipboard text={avdumpList[fileId].hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
                <Icon path={icon.path} spin={icon.path === mdiLoading} size={1} className={`${icon.color} cursor-pointer`} title={icon.title} />
              </CopyToClipboard>
            ) : (
              <Button onClick={() => handleClick(icon.state)} className={cx((icon.state === 'dumping' || dumpInProgress) && 'cursor-default')}>
                <Icon path={icon.path} spin={icon.path === mdiLoading} size={1} className={icon.color} title={icon.title} />
              </Button>
            )}
          </div>
        );
      },
      meta: {
        className: 'w-20',
      },
    }),
  ];

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

  useEffect(() => {
    table.resetRowSelection();
  }, [files, table]);

  const selectedRows = useMemo(
    () => tableSelectedRows.rows.map(row => row.original),
    [tableSelectedRows],
  );

  const avdumpFiles = async () => {
    for (let i = 0; i < selectedRows.length; i += 1) {
      // Files cannot be dumped in parallel on the server, yet
      // Use Promise.all when avdump3 is implemented and parallel dumping is possible
      // eslint-disable-next-line no-await-in-loop
      await runAvdump(selectedRows[i].ID);
    }
  };

  return (
    <div className="flex flex-col grow gap-y-8">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={files.Total} />}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={search} onChange={e => setSearch(e.target.value)} inputClassName="px-4 py-3" />
            <Menu table={table} files={files} refetch={() => filesQuery.refetch()} />
            <TransitionDiv show={selectedRows.length !== 0} className="flex gap-x-3">
              <Button
                className="px-4 py-3 bg-highlight-1 flex gap-x-2.5 font-semibold"
                onClick={() => navigate('link', { state: { selectedRows } })}
              >
                <Icon path={mdiOpenInNew} size={0.8333} />
                Manual Link
              </Button>
              <Button className="px-4 py-3 bg-highlight-1 flex gap-x-2.5 font-semibold" onClick={() => avdumpFiles()} disabled={dumpInProgress}>
                <Icon path={mdiDumpTruck} size={0.8333} />
                {dumpInProgress ? 'Dumping Files...' : 'AVDump Files'}
              </Button>
            </TransitionDiv>
          </div>
        </ShokoPanel>
      </div>

      <TransitionDiv className="flex grow overflow-y-auto rounded-md bg-background-alt border border-background-border p-8">
        {filesQuery.isLoading && (
          <div className="flex grow justify-center items-center text-highlight-1">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}
        {!filesQuery.isLoading && files.Total > 0 && (
          <UtilitiesTable table={table} sortCriteria={sortCriteria} setSortCriteria={setSortCriteria} skipSort={Boolean(debouncedSearch)} />
        )}
        {!filesQuery.isLoading && files.Total === 0 && (
          <div className="flex items-center justify-center grow font-semibold">No unrecognized file(s)!</div>
        )}
      </TransitionDiv>

    </div>
  );
}

export default UnrecognizedTab;
