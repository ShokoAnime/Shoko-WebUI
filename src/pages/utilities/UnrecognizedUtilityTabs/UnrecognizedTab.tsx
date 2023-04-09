import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { forEach, get, groupBy, toNumber } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiDatabaseSearchOutline, mdiDatabaseSyncOutline,
  mdiDumpTruck, mdiMagnify, mdiRestart,
  mdiLinkVariantPlus, mdiMinusCircleOutline,
  mdiEyeOffOutline, mdiCloseCircleOutline,
  mdiHelpCircleOutline, mdiLoading,
  mdiFileDocumentAlertOutline, mdiFileDocumentCheckOutline,
} from '@mdi/js';
import {
  createColumnHelper,
  getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ScrollSync } from 'react-scroll-sync';

import toast from '../../../components/Toast';
import { fuzzyFilter } from '../../../core/util';

import Button from '../../../components/Input/Button';
import Input from '../../../components/Input/Input';
import TransitionDiv from '../../../components/TransitionDiv';
import AniDBSeriesLinkPanel from './Components/AniDBSeriesLinkPanel';

import SeriesLinkPanel from './Components/SeriesLinkPanel';
import SelectedFilesPanel from './Components/SelectedFilesPanel';
import EpisodeLinkPanel from './Components/EpisodeLinkPanel';
import UtilitiesTable from './Components/UtilitiesTable';
import SelectedFileInfo from './Components/SelectedFileInfo';

import {
  useDeleteFileMutation,
  useGetFileUnrecognizedQuery,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
  usePutFileIgnoreMutation,
  useLazyPostFileAVDumpQuery,
  usePostFileLinkMutation,
} from '../../../core/rtkQuery/splitV3Api/fileApi';
import {
  setSelectedSeries,
  setManualLink,
  setSelectedRows,
  setLinks,
  setSelectedFile,
} from '../../../core/slices/utilities/unrecognized';
import { setItem as setAvdumpItem } from '../../../core/slices/utilities/avdump';
import { useUnrecognizedUtilityContext } from '../UnrecognizedUtility';

import type { FileType, FileLinkApiType } from '../../../core/types/api/file';
import type { SeriesAniDBSearchResult } from '../../../core/types/api/series';
import type { RootState } from '../../../core/store';

const columnHelper = createColumnHelper<FileType>();

function UnrecognizedTab() {
  const { columns: tempColumns, setFilesCount } = useUnrecognizedUtilityContext();

  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileDeleteTrigger] = useDeleteFileMutation();
  const [fileAvdumpTrigger] = useLazyPostFileAVDumpQuery();
  const [fileLinkEpisodesTrigger] = usePostFileLinkMutation();

  const { links, manualLink, selectedSeries, selectedRows, selectedFile } = useSelector((state: RootState) => state.utilities.unrecognized);
  const avdumpList = useSelector((state: RootState) => state.utilities.avdump);

  const dispatch = useDispatch();

  const [columnFilters, setColumnFilters] = useState([{ id: 'filename', value: '' }] as Array<{ id: string; value: string }>);
  const [dumpInProgress, setDumpInProgress] = useState(false);

  const allowEd2kCopy = useMemo(() => {
    let notFound = false;
    forEach(selectedRows, (row) => {
      if (!avdumpList[row.ID]?.hash) {
        notFound = true;
        return false;
      }
    });
    return !notFound;
  }, [selectedRows, avdumpList]);

  useEffect(() => {
    setFilesCount(files.Total);
  }, [files.Total]);

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
          path: mdiHelpCircleOutline,
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
          <div className="flex justify-center">
            {icon.state === 'success' ? (
              <CopyToClipboard text={avdumpList[fileId].hash || ''} onCopy={() => toast.success('Copied to clipboard!')}>
                <Icon path={icon.path} spin={icon.path === mdiLoading} size={1} className={`${icon.color} mr-2 cursor-pointer`} title={icon.title} />
              </CopyToClipboard>
            ) : (
              <Button onClick={() => handleClick(icon.state)} className={cx((icon.state === 'dumping' || dumpInProgress) && 'cursor-default')}>
                <Icon path={icon.path} spin={icon.path === mdiLoading} size={1} className={`${icon.color} mr-2`} title={icon.title} />
              </Button>
            )}
          </div>
        );
      },
      meta: {
        className: 'w-16',
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
    const newSelection = table.getSelectedRowModel().rows.map(row => row.original);
    if (selectedFile > 1 && get(newSelection, selectedFile - 1, null) === null) {
      //Reset active file, since it is probably invalid after selection changed
      dispatch(setSelectedFile(1));
    }
    dispatch(setSelectedRows(newSelection));
  }, [table.getSelectedRowModel()]);

  useEffect(() => {
    table.resetRowSelection();
  }, [files.List]);

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

  const avdumpFiles = async (selected = false) => {
    const fileList = selected ? selectedRows : files.List;
    for (let i = 0; i < fileList.length; i ++) {
      await runAvdump(fileList[i].ID);
    }
  };

  const copyEd2kLinks = () => {
    let ed2kLinks = '';
    forEach(selectedRows, row => avdumpList[row.ID]?.hash && (ed2kLinks += `${avdumpList[row.ID]?.hash}\n`));
    return ed2kLinks;
  };

  const groupedLinks = useMemo(() => groupBy(links, 'EpisodeID'), [links]);

  const makeLinks = () => {
    forEach(groupedLinks, async (fileIds, episodeID) => {
      const payload: FileLinkApiType = {
        episodeID: toNumber(episodeID),
        fileIDs: [],
      };
      payload.episodeID = toNumber(episodeID);
      forEach(fileIds, (link) => {
        if (link.FileID === 0) {
          return;
        }
        payload.fileIDs.push(link.FileID);
      });

      if (payload.episodeID === 0 || payload.fileIDs.length === 0) { return; }
      try {
        await fileLinkEpisodesTrigger(payload).unwrap();
        toast.success('Episode linked!');
      } catch (error) {
        toast.success('Episode linking failed!');
        return;
      }
      
      
      await filesQuery.refetch();
      dispatch(setManualLink(false));
      dispatch(setLinks([]));
      dispatch(setSelectedSeries({} as SeriesAniDBSearchResult));
    });
  };

  const renderOperations = (common = false) => {
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string, highlight = false) => (
      <Button onClick={onClick} className="flex items-center mr-4 font-normal text-font-main">
        <Icon path={icon} size={1} className={cx(['mr-1', highlight && 'text-highlight-1'])} />
        {name}
      </Button>
    );

    return (
      <>
        <TransitionDiv className="flex grow absolute" show={common}>
          {renderButton(async () => { table.resetRowSelection(); await filesQuery.refetch(); }, mdiRestart, 'Refresh')}
          {renderButton(() => rescanFiles(), mdiDatabaseSearchOutline, 'Rescan All')}
          {renderButton(() => rehashFiles(), mdiDatabaseSyncOutline, 'Rehash All')}
          {renderButton(() => avdumpFiles(), mdiDumpTruck, 'AVDump All')}
        </TransitionDiv>
        <TransitionDiv className="flex grow absolute" show={!common}>
          {renderButton(() => dispatch(setManualLink(!manualLink)), mdiLinkVariantPlus, 'Manually Link')}
          {renderButton(() => rescanFiles(true), mdiDatabaseSearchOutline, 'Rescan')}
          {renderButton(() => rehashFiles(true), mdiDatabaseSyncOutline, 'Rehash')}
          {renderButton(() => avdumpFiles(true), mdiDumpTruck, 'AVDump')}
          {renderButton(() => ignoreFiles(), mdiEyeOffOutline, 'Ignore')}
          {renderButton(() => deleteFiles(), mdiMinusCircleOutline, 'Delete', true)}
          {renderButton(() => table.resetRowSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };
  
  const renderSeriesLinkPanel = () => {
    if (manualLink) { return null; }
    const path = get(selectedRows, '[0]Locations[0].RelativePath', '') as string;
    return (
      <AniDBSeriesLinkPanel initialQuery={path !== '' ? path.split(/[\/\\]/g).pop() ?? '' : ''} />
    );
  };

  return (
    <TransitionDiv className="flex flex-col grow h-full w-full">

      <div className="flex flex-col grow">
        <div className="flex">
          <Input disabled={manualLink} type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value={columnFilters[0].value} onChange={e => setColumnFilters([{ id: 'filename', value: e.target.value }])} />
          <div className={cx(['box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2 relative', manualLink && 'pointer-events-none opacity-75'])}>
            {renderOperations(selectedRows.length === 0) }
            <div className="ml-auto text-highlight-2 font-semibold">{selectedRows.length} Files Selected</div>
          </div>
          <div className="flex pl-2.5 items-center w-40 relative">
            <TransitionDiv className="flex absolute" show={!manualLink}>
              {/*TODO: Don't allow copy when one of the selected rows is not dumped*/}
              <CopyToClipboard text={copyEd2kLinks()}>
                <Button
                  onClick={() => {}}
                  className="px-3 py-2 bg-highlight-1 rounded-md border !border-background-border ml-2"
                  disabled={selectedRows.length === 0 || !allowEd2kCopy}
                >Copy ED2K Links</Button>
              </CopyToClipboard>
            </TransitionDiv>
            <TransitionDiv className="flex" show={manualLink}>
              <Button onClick={() => {
                dispatch(setManualLink(false));
                dispatch(setSelectedSeries({} as SeriesAniDBSearchResult));
              }} className="px-3 py-2 bg-background-alt rounded-md border !border-background-border">Cancel</Button>
              <Button onClick={makeLinks} className="px-3 py-2 bg-highlight-1 rounded-md border !border-background-border ml-2">Save</Button>
            </TransitionDiv>
          </div>
        </div>
        <ScrollSync>
          <div className="flex grow basis-0 overflow-y-hidden relative mt-4">
            <TransitionDiv className="flex mt-1 h-full w-full basis-0 overflow-y-auto grow gap-x-4 absolute" show={manualLink}>
              <SelectedFilesPanel />
              {selectedSeries?.ID
                ? (<EpisodeLinkPanel />)
                : (<SeriesLinkPanel />)}
            </TransitionDiv>
            <TransitionDiv className="w-full h-full basis-0 overflow-y-auto rounded-lg bg-background-nav border border-background-border absolute" show={!manualLink}>
              {files.Total > 0 ? (
                <UtilitiesTable table={table} />
              ) : (
                <div className="flex items-center justify-center h-full font-semibold">No unrecognized file(s)!</div>
              )}
            </TransitionDiv>
          </div>
        </ScrollSync>
      </div>

      <div className={cx('flex mt-4 space-x-4 transition-[height]', manualLink ? 'h-48' : 'h-[19.6rem]')}>
        <SelectedFileInfo fullWidth={manualLink} />
        {renderSeriesLinkPanel()}
      </div>

    </TransitionDiv>
  );
}

export default UnrecognizedTab;
