import React, { useEffect } from 'react';
import cx from 'classnames';
import { forEach } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import {
  mdiDatabaseSearchOutline, mdiDatabaseSyncOutline,
  mdiDumpTruck, mdiMagnify, mdiRestart,
  mdiLinkVariantPlus, mdiMinusCircleOutline,
  mdiEyeOffOutline, mdiCloseCircleOutline,
} from '@mdi/js';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import Button from '../../../components/Input/Button';
import Input from '../../../components/Input/Input';
import TransitionDiv from '../../../components/TransitionDiv';

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
} from '../../../core/rtkQuery/fileApi';
import { setSelectedSeries, setManualLink, setSelectedRows } from '../../../core/slices/utilities/unrecognized';

import type { FileType } from '../../../core/types/api/file';
import type { SeriesAniDBSearchResult } from '../../../core/types/api/series';
import { RootState } from '../../../core/store';


type Props = {
  columns: ColumnDef<FileType, any>[];
  show: boolean;
};

function UnrecognizedTab({ columns, show }: Props) {
  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileDeleteTrigger] = useDeleteFileMutation();
  const { manualLink, selectedSeries, selectedRows } = useSelector((state: RootState) => state.utilities.unrecongnized);
  const dispatch = useDispatch();

  const table = useReactTable({
    data: files.List,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  useEffect(() => {
    dispatch(setSelectedRows(table.getSelectedRowModel().rows.map(row => row.original)));
  }, [table.getSelectedRowModel()]);

  const rescanFiles = (selected = false) => {
    if (selected) {
      forEach(selectedRows, (row) => {
        fileRescanTrigger(row.ID).catch(() => {});
      });
    } else {
      forEach(files.List, file => fileRescanTrigger(file.ID));
    }
  };

  const rehashFiles = (selected = false) => {
    if (selected) {
      forEach(selectedRows, (row) => {
        fileRehashTrigger(row.ID).catch(() => {});
      });
    } else {
      forEach(files.List, file => fileRehashTrigger(file.ID));
    }
  };

  const ignoreFiles = () => {
    forEach(selectedRows, (row) => {
      fileIgnoreTrigger({ fileId: row.ID, value: true }).catch(() => {});
    });
  };

  const deleteFiles = () => {
    forEach(selectedRows, (row) => {
      fileDeleteTrigger({ fileId: row.ID, removeFolder: true }).catch(() => {});
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
          {renderButton(() => filesQuery.refetch(), mdiRestart, 'Refresh')}
          {renderButton(() => rescanFiles(), mdiDatabaseSearchOutline, 'Rescan All')}
          {renderButton(() => rehashFiles(), mdiDatabaseSyncOutline, 'Rehash All')}
          {renderButton(() => {}, mdiDumpTruck, 'AVDump All')}
        </TransitionDiv>
        <TransitionDiv className="flex grow absolute" show={!common}>
          {renderButton(() => dispatch(setManualLink(!manualLink)), mdiLinkVariantPlus, 'Manually Link')}
          {renderButton(() => rescanFiles(true), mdiDatabaseSearchOutline, 'Rescan')}
          {renderButton(() => rehashFiles(true), mdiDatabaseSyncOutline, 'Rehash')}
          {renderButton(() => {}, mdiDumpTruck, 'AVDump')}
          {renderButton(() => ignoreFiles(), mdiEyeOffOutline, 'Ignore')}
          {renderButton(() => deleteFiles(), mdiMinusCircleOutline, 'Delete', true)}
          {renderButton(() => table.resetRowSelection(), mdiCloseCircleOutline, 'Cancel Selection', true)}
        </TransitionDiv>
      </>
    );
  };

  return (
    <TransitionDiv className="flex flex-col grow absolute h-full w-full" show={show}>

      <div className="flex flex-col grow">
        <div className="flex">
          <Input type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value="" onChange={() => {}} />
          <div className={cx(['box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2 relative', manualLink && 'pointer-events-none opacity-75'])}>
            {renderOperations(selectedRows.length === 0) }
            <div className="ml-auto text-highlight-2 font-semibold">{selectedRows.length} Files Selected</div>
          </div>
          <TransitionDiv className={cx('flex pl-2.5 items-center', { 'hidden': !manualLink })}>
            <Button onClick={() => {
              dispatch(setManualLink(false));
              dispatch(setSelectedSeries({} as SeriesAniDBSearchResult));
            }} className="px-3 py-2 bg-background-alt rounded-md border !border-background-border">Cancel</Button>
            <Button onClick={() => {}} className="px-3 py-2 bg-highlight-1 rounded-md border !border-background-border ml-2">Save</Button>
          </TransitionDiv>
        </div>
        <TransitionDiv className={cx('flex mt-5 overflow-y-auto grow gap-x-4', { 'hidden': !manualLink })}>
          <SelectedFilesPanel />
          {selectedSeries?.ID
            ? (<EpisodeLinkPanel />)
            : (<SeriesLinkPanel />)}
        </TransitionDiv>
        <TransitionDiv className={cx('w-full grow basis-0 mt-4 overflow-y-auto rounded-lg bg-background-nav border border-background-border', { 'hidden': manualLink })}>
          {files.Total > 0 ? (
            <UtilitiesTable table={table} />
          ) : (
            <div className="flex items-center justify-center h-full font-semibold">No unrecognized files(s)!</div>
          )}
        </TransitionDiv>
      </div>

      <SelectedFileInfo />

    </TransitionDiv>
  );
}

export default UnrecognizedTab;
