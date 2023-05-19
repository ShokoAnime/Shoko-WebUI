import React, { useEffect, useState } from 'react';
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
  getSortedRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import CopyToClipboard from 'react-copy-to-clipboard';

import toast from '../../../components/Toast';
import { fuzzyFilter } from '../../../core/util';

import Button from '../../../components/Input/Button';
import TransitionDiv from '../../../components/TransitionDiv';
import UtilitiesTable from './Components/UtilitiesTable';

import {
  useDeleteFileMutation,
  useGetFileUnrecognizedQuery,
  useLazyPostFileAVDumpQuery,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
  usePutFileIgnoreMutation,
} from '../../../core/rtkQuery/splitV3Api/fileApi';
import { setSelectedRows } from '../../../core/slices/utilities/unrecognized';
import { setItem as setAvdumpItem } from '../../../core/slices/utilities/avdump';
import { Title, useUnrecognizedUtilityContext } from '../UnrecognizedUtility';

import type { FileType } from '../../../core/types/api/file';
import type { RootState } from '../../../core/store';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Input from '../../../components/Input/Input';
import { push } from '@lagunovsky/redux-react-router';
import ItemCount from './Components/ItemCount';
import MenuButton from './Components/MenuButton';
import AvDumpSeriesSelectModal from './Components/AvDumpSeriesSelectModal';

const columnHelper = createColumnHelper<FileType>();

const Menu = ({ table }: { table: Table<FileType>}) => {
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);
  const { selectedRows } = useSelector((state: RootState) => state.utilities.unrecognized);

  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const [fileDeleteTrigger] = useDeleteFileMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileRescanTrigger] = usePostFileRescanMutation();

  const [seriesSelectModal, setSeriesSelectModal] = useState(false);

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
          <MenuButton onClick={async () => { table.resetRowSelection(); await filesQuery.refetch(); }} icon={mdiRefresh} name="Refresh List" />
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
        <span className="text-highlight-2 ml-auto">{selectedRows.length}&nbsp;</span>Files Selected
      </div>
      <AvDumpSeriesSelectModal show={seriesSelectModal} onClose={() => setSeriesSelectModal(false)} links={ed2kLinks()} />
    </>
  );
};

function UnrecognizedTab() {
  const { columns: tempColumns } = useUnrecognizedUtilityContext();

  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const [fileAvdumpTrigger] = useLazyPostFileAVDumpQuery();

  const { selectedRows } = useSelector((state: RootState) => state.utilities.unrecognized);
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

  const dispatch = useDispatch();

  const [columnFilters, setColumnFilters] = useState([{ id: 'filename', value: '' }] as Array<{ id: string; value: string }>);
  const [dumpInProgress, setDumpInProgress] = useState(false);

  const runAvdump = async (fileId: number) => {
    setDumpInProgress(true);
    dispatch(setAvdumpItem({ id: fileId, hash: '', fetching: true }));
    const result = await fileAvdumpTrigger(fileId);
    dispatch(setAvdumpItem({ id: fileId, hash: result.data?.Ed2k ?? 'x', fetching: false }));
    setDumpInProgress(false);
  };

  const avdumpFiles = async () => {
    for (let i = 0; i < selectedRows.length; i ++) {
      await runAvdump(selectedRows[i].ID);
    }
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
    state: {
      columnFilters,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    dispatch(setSelectedRows(table.getSelectedRowModel().rows.map(row => row.original)));
  }, [table.getSelectedRowModel().rows.length]);

  useEffect(() => {
    table.resetRowSelection();
    dispatch(setSelectedRows([]));
  }, [filesQuery.requestId]);

  return (
    <div className="flex flex-col grow w-full h-full">

      <div>
        <ShokoPanel title={<Title />} options={<ItemCount filesCount={files.Total} />}>
          <div className="flex items-center gap-x-3">
            <Input type="text" placeholder="Search..." startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} inputClassName="px-4 py-3" />
            <Menu table={table} />
            <TransitionDiv show={selectedRows.length !== 0} className="flex gap-x-3">
              <Button className="px-4 py-3 bg-highlight-1 flex gap-x-2.5 font-semibold" onClick={() => dispatch(push('files-link'))}>
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

      <TransitionDiv className="grow w-full h-full overflow-y-auto rounded-lg bg-background-alt border border-background-border mt-8 p-8">
        {files.Total > 0 ? (
          <UtilitiesTable table={table} />
        ) : (
          <div className="flex items-center justify-center h-full font-semibold">No unrecognized file(s)!</div>
        )}
      </TransitionDiv>

    </div>
  );
}

export default UnrecognizedTab;
