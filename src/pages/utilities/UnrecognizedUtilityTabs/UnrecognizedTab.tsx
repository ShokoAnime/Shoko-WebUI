import React, { useEffect, useState } from 'react';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import cx from 'classnames';
import { countBy, find, forEach } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiChevronLeft, mdiChevronRight,
  mdiDatabaseSearchOutline, mdiDatabaseSyncOutline,
  mdiDumpTruck, mdiMagnify, mdiRestart,
  mdiLinkVariantPlus, mdiMinusCircleOutline,
  mdiEyeOffOutline, mdiCloseCircleOutline,
} from '@mdi/js';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Button from '../../../components/Input/Button';
import TransitionDiv from '../../../components/TransitionDiv';
import { useGetImportFoldersQuery } from '../../../core/rtkQuery/importFolderApi';

import SeriesLinkPanel from './Components/SeriesLinkPanel';
import SelectedFilesPanel from './Components/SelectedFilesPanel';
import EpisodeLinkPanel from './Components/EpisodeLinkPanel';

import type { SeriesAniDBSearchResult } from '../../../core/types/api/series';

import {
  useGetFileUnrecognizedQuery,
  usePostFileRehashMutation,
  usePostFileRescanMutation,
} from '../../../core/rtkQuery/fileApi';
import FileListPanel from './Components/FileListPanel';
import type { ImportFolderType } from '../../../core/types/api/import-folder';
import Input from '../../../components/Input/Input';

function UnrecognizedTab() {
  const files = useGetFileUnrecognizedQuery({ pageSize: 0 });
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];
  const [fileRescanTrigger] = usePostFileRescanMutation();
  const [fileRehashTrigger] = usePostFileRehashMutation();

  const [markedItems, setMarkedItems] = useState({} as { [key: number]: boolean });
  const [markedItemsCount, setMarkedItemsCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(1);
  const [manualLink, setManualLink] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState({} as SeriesAniDBSearchResult);

  useEffect(() => {
    const newMarkedItems = {} as { [key: number]: boolean };
    forEach(files.data?.List, (file) => {
      newMarkedItems[file.ID] = false;
    });
    setMarkedItems(newMarkedItems);
  }, [files.isLoading]);

  const changeSelectedFile = (operation: string) => {
    if (operation === 'prev') {
      if (selectedFile > 1) {
        setSelectedFile(selectedFile - 1);
      }
    } else {
      if (selectedFile < markedItemsCount) {
        setSelectedFile(selectedFile + 1);
      }
    }
  };

  const changeMarkedItems = (items: { [key: number]: boolean }) => {
    setMarkedItems(items);
    setMarkedItemsCount(countBy(items).true ?? 0);
    if (selectedFile >= markedItemsCount) changeSelectedFile('prev');
  };

  const fileInfoTitle = () => {
    if (markedItemsCount > 0) {
      return (
        <React.Fragment>
          Selected File Info
          <div className="flex ml-2">
            - <span className="text-highlight-2 ml-2">{selectedFile}/{markedItemsCount}</span>
          </div>
        </React.Fragment>
      );
    } else {
      return 'Selected File Info';
    }
  };

  const renderFileInfo = () => {
    const selectedFiles = files.data?.List.filter(item => markedItems[item.ID])!;
    const selectedFileInfo = selectedFiles[selectedFile - 1];

    const importFolderId = selectedFileInfo.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <TransitionDiv className="flex flex-col mt-2">
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
      </TransitionDiv>
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
      forEach(markedItems, (marked, fileId) => {
        if (marked) fileRescanTrigger(parseInt(fileId)).catch(() => {});
      });
    } else {
      forEach(files.data?.List, file => fileRescanTrigger(file.ID));
    }
  };

  const rehashFiles = (selected = false) => {
    if (selected) {
      forEach(markedItems, (marked, fileId) => {
        if (marked) fileRehashTrigger(parseInt(fileId)).catch(() => {});
      });
    } else {
      forEach(files.data?.List, file => fileRehashTrigger(file.ID));
    }
  };

  const cancelSelection = () => {
    const tempMarkedItems = markedItems;
    forEach(tempMarkedItems, (_, key) => {
      tempMarkedItems[key] = false;
    });
    changeMarkedItems(tempMarkedItems);
  };

  const renderOperations = (common = false) => {
    const renderButton = (onClick: (...args: any) => void, icon: string, name: string) => (
      <Button onClick={onClick} className="flex items-center mr-3 font-normal">
        <Icon path={icon} size={1} className="mr-1"/>
        {name}
      </Button>
    );

    return (
      <TransitionDiv className="flex grow">
        {common ? (
          <>
            {renderButton(() => files.refetch(), mdiRestart, 'Refresh')}
            {renderButton(() => rescanFiles(), mdiDatabaseSearchOutline, 'Rescan All')}
            {renderButton(() => rehashFiles(), mdiDatabaseSyncOutline, 'Rehash All')}
            {renderButton(() => {}, mdiDumpTruck, 'AVDump All')}
          </>
        ) : (
          <>
            {renderButton(() => setManualLink(!manualLink), mdiLinkVariantPlus, 'Manually Link')}
            {renderButton(() => rescanFiles(true), mdiDatabaseSearchOutline, 'Rescan')}
            {renderButton(() => rehashFiles(true), mdiDatabaseSyncOutline, 'Rehash')}
            {renderButton(() => {}, mdiDumpTruck, 'AVDump')}
            {renderButton(() => {}, mdiEyeOffOutline, 'Ignore')}
            {renderButton(() => {}, mdiMinusCircleOutline, 'Delete')}
            {renderButton(() => cancelSelection(), mdiCloseCircleOutline, 'Cancel Selection')}
          </>
        )}
      </TransitionDiv>
    );
  };

  const updateSelectedSeries = (series: SeriesAniDBSearchResult) => setSelectedSeries(series);

  return (
    <TransitionDiv className="flex flex-col grow">

      <div className="flex flex-col grow">
        <div className="flex">
          <Input type="text" placeholder="Search..." className="bg-background-nav mr-2" startIcon={mdiMagnify} id="search" value="" onChange={() => {}} />
          <div className={cx(['box-border flex grow bg-background-nav border border-background-border items-center rounded-md px-3 py-2', manualLink && 'pointer-events-none opacity-75'])}>
            {renderOperations(markedItemsCount === 0)}
            <div className="ml-auto text-highlight-2 font-semibold">{markedItemsCount} Files Selected</div>
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
            <SelectedFilesPanel files={files.data?.List.filter(item => markedItems[item.ID])!} selectedSeries={selectedSeries} />
            {selectedSeries?.ID
              ? (<EpisodeLinkPanel selectedSeries={selectedSeries} setSeries={updateSelectedSeries} />)
              : (<SeriesLinkPanel setSeries={updateSelectedSeries}/>)}
          </TransitionDiv>
        ) : (
          <FileListPanel markedItems={markedItems} setMarkedItems={changeMarkedItems} />
        )}
      </div>

      <ShokoPanel title={fileInfoTitle()} className="!h-48 mt-4" options={renderPanelOptions()}>
        {markedItemsCount === 0 ? (
          <TransitionDiv className="flex items-center justify-center mt-2 font-semibold">
            No File(s) Selected
          </TransitionDiv>
        ) : renderFileInfo()}
      </ShokoPanel>

    </TransitionDiv>
  );
}

export default UnrecognizedTab;
