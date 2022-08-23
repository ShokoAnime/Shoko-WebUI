import React, { useMemo, useState } from 'react';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import cx from 'classnames';
import { find, forEach } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiChevronLeft, mdiChevronRight,
  mdiDatabaseSearchOutline, mdiDatabaseSyncOutline,
  mdiDumpTruck, mdiMagnify, mdiRestart,
  mdiLinkVariantPlus, mdiMinusCircleOutline,
  mdiEyeOffOutline, mdiCloseCircleOutline,
} from '@mdi/js';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import Button from '../../../components/Input/Button';
import Input from '../../../components/Input/Input';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import TransitionDiv from '../../../components/TransitionDiv';

import SeriesLinkPanel from './Components/SeriesLinkPanel';
import SelectedFilesPanel from './Components/SelectedFilesPanel';
import EpisodeLinkPanel from './Components/EpisodeLinkPanel';
import UtilitiesTable from './Components/UtilitiesTable';

import {
  useDeleteFileMutation,
  useGetFileUnrecognizedQuery,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
  usePutFileIgnoreMutation,
} from '../../../core/rtkQuery/fileApi';
import { useGetImportFoldersQuery } from '../../../core/rtkQuery/importFolderApi';

import type { FileType } from '../../../core/types/api/file';
import type { ImportFolderType } from '../../../core/types/api/import-folder';
import type { SeriesAniDBSearchResult } from '../../../core/types/api/series';

type Props = {
  columns: ColumnDef<FileType, any>[];
  show: boolean;
};

function UnrecognizedTab({ columns, show }: Props) {
  const filesQuery = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const files = filesQuery?.data ?? { Total: 0, List: [] };
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();
  const [fileIgnoreTrigger] = usePutFileIgnoreMutation();
  const [fileDeleteTrigger] = useDeleteFileMutation();

  const [selectedFile, setSelectedFile] = useState(1);
  const [manualLink, setManualLink] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState({} as SeriesAniDBSearchResult);

  const table = useReactTable({
    data: files.List,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map(row => row.original), [table.getSelectedRowModel()]);

  const changeSelectedFile = (operation: string) => {
    if (operation === 'prev') {
      if (selectedFile > 1) {
        setSelectedFile(selectedFile - 1);
      }
    } else {
      if (selectedFile < table.getSelectedRowModel().rows.length) {
        setSelectedFile(selectedFile + 1);
      }
    }
  };

  const fileInfoTitle = () => {
    const isEmpty = selectedRows.length <= 0;
    return (
      <React.Fragment>
        Selected File Info
        <TransitionDiv className="flex ml-2" show={!isEmpty}>
          - <span className="text-highlight-2 ml-2">{isEmpty ? '-/-' : `${selectedFile}/${selectedRows.length}`}</span>
        </TransitionDiv>
      </React.Fragment>
    );
  };

  const renderFileInfo = () => {
    if (selectedRows.length === 0) return;
    const selectedFileInfo = selectedRows[selectedFile - 1];

    const importFolderId = selectedFileInfo.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <>
        <div className="flex">
          <div className="flex flex-col w-2/5">
            <div className="font-semibold mb-1">Filename</div>
            {selectedFileInfo.Locations[0].RelativePath}
          </div>

          <div className="flex flex-col w-1/5">
            <div className="font-semibold mb-1">Size</div>
            {prettyBytes(selectedFileInfo.Size, { binary: true })}
          </div>

          <div className="flex flex-col w-1/4">
            <div className="font-semibold mb-1">Folder</div>
            {importFolder}
          </div>

          <div className="flex flex-col w-48">
            <div className="font-semibold mb-1">Import Date</div>
            {moment(selectedFileInfo.Created).format('MMMM DD YYYY, HH:mm')}
          </div>
        </div>

        <div className="flex mt-4">
          <div className="flex flex-col w-2/5">
            <div className="font-semibold mb-1">Hash</div>
            {selectedFileInfo.Hashes.ED2K}
          </div>

          <div className="flex flex-col w-1/5">
            <div className="font-semibold mb-1">MD5</div>
            {selectedFileInfo.Hashes.MD5}
          </div>

          <div className="flex flex-col w-1/4">
            <div className="font-semibold mb-1">SHA1</div>
            {selectedFileInfo.Hashes.SHA1}
          </div>

          <div className="flex flex-col w-48">
            <div className="font-semibold mb-1">CRC32</div>
            {selectedFileInfo.Hashes.CRC32}
          </div>
        </div>
      </>
    );
  };

  const renderPanelOptions = () => (
    <div className="flex">
      <Button onClick={() => changeSelectedFile('prev')}>
        <Icon path={mdiChevronLeft} size={1} className="opacity-75 text-highlight-1" />
      </Button>
      <Button onClick={() => changeSelectedFile('next')} className="ml-2">
        <Icon path={mdiChevronRight} size={1} className="opacity-75 text-highlight-1" />
      </Button>
    </div>
  );

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
          {renderButton(() => setManualLink(!manualLink), mdiLinkVariantPlus, 'Manually Link')}
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

  const updateSelectedSeries = (series: SeriesAniDBSearchResult) => setSelectedSeries(series);

  return (
    <TransitionDiv className="flex flex-col grow absolute h-full w-full" show={show}>

      <div className="flex flex-col grow">
        <div className="flex">
          <Input type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value="" onChange={() => {}} />
          <div className={cx(['box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2 relative', manualLink && 'pointer-events-none opacity-75'])}>
            {renderOperations(selectedRows.length === 0) }
            <div className="ml-auto text-highlight-2 font-semibold">{selectedRows.length} Files Selected</div>
          </div>
          {manualLink && (
            <TransitionDiv className="flex pl-2.5 items-center">
              <Button onClick={() => {
                setManualLink(false);
                setSelectedSeries({} as SeriesAniDBSearchResult);
              }} className="px-3 py-2 bg-background-alt rounded-md border !border-background-border">Cancel</Button>
              <Button onClick={() => {}} className="px-3 py-2 bg-highlight-1 rounded-md border !border-background-border ml-2">Save</Button>
            </TransitionDiv>
          )}
        </div>
        {manualLink ? (
          <TransitionDiv className="flex mt-5 overflow-y-auto grow gap-x-4">
            <SelectedFilesPanel files={selectedRows} selectedSeries={selectedSeries} />
            {selectedSeries?.ID
              ? (<EpisodeLinkPanel files={selectedRows} selectedSeries={selectedSeries} setSeries={updateSelectedSeries} />)
              : (<SeriesLinkPanel setSeries={updateSelectedSeries}/>)}
          </TransitionDiv>
        ) : (
          <TransitionDiv className="w-full grow basis-0 mt-4 overflow-y-auto rounded-lg bg-background-nav border border-background-border">
            {files.Total > 0 ? (
              <UtilitiesTable table={table} />
            ) : (
              <div className="flex items-center justify-center h-full font-semibold">No unrecognized files(s)!</div>
            )}
          </TransitionDiv>
        )}
      </div>

      <ShokoPanel title={fileInfoTitle()} className="!h-48 mt-4" options={renderPanelOptions()}>
        <div className="flex grow flex-col items-center relative">
          <TransitionDiv className="mt-2 font-semibold absolute" show={selectedRows.length === 0}>
            No File(s) Selected
          </TransitionDiv>
          <TransitionDiv className="flex grow flex-col mt-2 w-full absolute" show={selectedRows.length !== 0}>
            {renderFileInfo()}
          </TransitionDiv>
        </div>
      </ShokoPanel>

    </TransitionDiv>
  );
}

export default UnrecognizedTab;
