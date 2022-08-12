import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import moment from 'moment';
import { countBy, find, forEach, pickBy } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiChevronLeft, mdiChevronRight,
  mdiDatabaseSearchOutline, mdiDatabaseSyncOutline,
  mdiDumpTruck, mdiMagnify,
  mdiLinkVariantPlus, mdiMinusBoxOutline,
  mdiEyeOffOutline, mdiCloseBoxOutline,
} from '@mdi/js';

import Events from '../../../core/events';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Button from '../../../components/Input/Button';
import Checkbox from '../../../components/Input/Checkbox';
import TransitionDiv from '../../../components/TransitionDiv';
import { useGetImportFoldersQuery } from '../../../core/rtkQuery/importFolderApi';

import type { FileType } from '../../../core/types/api/file';
import { ImportFolderType } from '../../../core/types/api/import-folder';

type Props = {
  files: Array<FileType>;
};

function UnrecognizedTab(props: Props) {
  const { files } = props;

  const dispatch = useDispatch();

  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const [markedItems, setMarkedItems] = useState({} as { [key: number]: boolean });
  const [markedItemsCount, setMarkedItemsCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(1);

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

  const handleInputChange = (event: any) => {
    const { id, checked } = event.target;
    setMarkedItems({ ...markedItems, [id]: checked });
    setMarkedItemsCount(countBy({ ...markedItems, [id]: checked }).true ?? 0);
    if (!checked && selectedFile >= markedItemsCount) changeSelectedFile('prev');
  };

  const renderRow = (Id: number, importFolder: string, filename: string, size: number, date: string) => (
    <tr className="box-border bg-background-nav border border-background-border rounded-md" key={Id}>
      <td className="py-3.5">
        <div className="flex items-center justify-center">
          <Checkbox id={Id.toString()} isChecked={markedItems[Id]} onChange={handleInputChange} />
        </div>
      </td>
      <td className="py-3.5">{importFolder}</td>
      <td className="py-3.5">{filename}</td>
      <td className="py-3.5">{prettyBytes(size, { binary: true })}</td>
      <td className="py-3.5">{moment(date).format('MMMM DD YYYY, HH:mm')}</td>
    </tr>
  );

  const rows: Array<React.ReactNode> = [];
  forEach(files, (file) => {
    const importFolderId = file.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Name ?? '';
    rows.push(renderRow(file.ID, importFolder, file.Locations[0].RelativePath, file.Size, file.Created));
  });

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
    const selectedFiles = files.filter(item => markedItems[item.ID]);
    const selectedFileInfo = selectedFiles[selectedFile - 1];

    const importFolderId = selectedFileInfo.Locations[0].ImportFolderID;
    const importFolder = find(importFolders, { ID: importFolderId })?.Path ?? '';

    return (
      <div className="flex flex-col mt-2">
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

          <div className="flex flex-col w-40">
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

          <div className="flex flex-col w-40">
            <div className="font-semibold mb-1">CRC32</div>
            {selectedFileInfo.Hashes.CRC32}
          </div>
        </div>
      </div>
    );
  };

  const renderPanelOptions = () => (
    <div className="flex">
      <Button onClick={() => changeSelectedFile('prev')}>
        <Icon path={mdiChevronLeft} size={1} className="opacity-75 text-primary" />
      </Button>
      <Button onClick={() => changeSelectedFile('next')} className="ml-2">
        <Icon path={mdiChevronRight} size={1} className="opacity-75 text-primary" />
      </Button>
    </div>
  );

  const rescanFiles = (selected = false) => {
    if (selected) {
      const fileIds = Object.keys(pickBy(markedItems, item => item));
      forEach(fileIds, fileId => dispatch({ type: Events.UTILITIES_RESCAN, payload: fileId }));
    } else {
      forEach(files, file => dispatch({ type: Events.UTILITIES_RESCAN, payload: file.ID }));
    }
  };

  const rehashFiles = (selected = false) => {
    if (selected) {
      const fileIds = Object.keys(pickBy(markedItems, item => item));
      forEach(fileIds, fileId => dispatch({ type: Events.UTILITIES_REHASH, payload: fileId }));
    } else {
      forEach(files, file => dispatch({ type: Events.UTILITIES_REHASH, payload: file.ID }));
    }
  };

  const renderCommonOperations = () => (
    <TransitionDiv className="flex grow">
      <Button onClick={() => rescanFiles()} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDatabaseSearchOutline} size={1} className="mr-1"/>
        Rescan All
      </Button>
      <Button onClick={() => rehashFiles()} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDatabaseSyncOutline} size={1} className="mr-1"/>
        Rehash All
      </Button>
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDumpTruck} size={1} className="mr-1"/>
        AVDump All
      </Button>
    </TransitionDiv>
  );

  const renderOperations = () => (
    <TransitionDiv className="flex grow">
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiLinkVariantPlus} size={1} className="mr-1"/>
        Manually Link
      </Button>
      <Button onClick={() => rescanFiles(true)} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDatabaseSearchOutline} size={1} className="mr-1"/>
        Rescan
      </Button>
      <Button onClick={() => rehashFiles(true)} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDatabaseSyncOutline} size={1} className="mr-1"/>
        Rehash
      </Button>
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiDumpTruck} size={1} className="mr-1"/>
        AVDump
      </Button>
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiEyeOffOutline} size={1} className="mr-1"/>
        Ignore
      </Button>
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiMinusBoxOutline} size={1} className="mr-1"/>
        Delete
      </Button>
      <Button onClick={() => {}} className="flex items-center ml-3 font-normal">
        <Icon path={mdiCloseBoxOutline} size={1} className="mr-1"/>
        Cancel Selection
      </Button>
    </TransitionDiv>
  );

  return (
    <TransitionDiv className="flex flex-col grow">

      <div className="flex flex-col grow">
        <div className="box-border flex bg-background-nav border border-background-border items-center rounded-md px-3 py-2">
          <Icon path={mdiMagnify} size={1} />
          <input type="text" placeholder="Search..." className="ml-2 bg-background-nav border-b border-font-main" />
          {markedItemsCount > 0 ? renderOperations() : renderCommonOperations()}
          <div className="ml-auto text-highlight-2 font-semibold">{markedItemsCount} Files Selected</div>
        </div>
        <div className="flex mt-4 overflow-y-auto grow basis-0 items-start">
          <table className="table-fixed text-left w-full">
            <thead className="sticky top-0">
            <tr className="box-border bg-background-nav border border-background-border rounded-md">
              {/*TODO: Select all checkbox*/}
              <th className="w-20 py-3.5" />
              <th className="w-52 py-3.5 font-semibold">Import Folder</th>
              <th className="w-auto py-3.5 font-semibold">Filename</th>
              <th className="w-32 py-3.5 font-semibold">Size</th>
              <th className="w-56 py-3.5 font-semibold">Date</th>
            </tr>
            </thead>
            <tbody>
            {rows}
            </tbody>
          </table>
        </div>
      </div>

      <ShokoPanel title={fileInfoTitle()} className="h-72 mt-4" options={renderPanelOptions()}>
        {markedItemsCount === 0 ? (
          <div className="flex items-center justify-center mt-2 font-semibold">
            No File(s) Selected
          </div>
        ) : renderFileInfo()}
      </ShokoPanel>

    </TransitionDiv>
  );
}

export default UnrecognizedTab;
