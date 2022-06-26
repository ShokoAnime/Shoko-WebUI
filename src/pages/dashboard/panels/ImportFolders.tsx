import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import {
  mdiDatabaseEditOutline,
  mdiDatabaseSearchOutline,
} from '@mdi/js';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Button from '../../../components/Input/Button';
import { setEdit } from '../../../core/slices/modals/importFolder';

import type { ImportFolderType } from '../../../core/types/api/import-folder';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { Icon } from '@mdi/react';

function ImportFolders() {
  const dispatch = useDispatch();

  const hasFetched = useSelector((state: RootState) => state.mainpage.fetched.importFolders);
  const importFolders = useSelector((state: RootState) => state.mainpage.importFolders);

  const rescanFolder = (ID: number) => dispatch({ type: Events.IMPORT_FOLDER_RESCAN, payload: ID });
  const openImportFolderModalEdit = (ID: number) => dispatch(setEdit(ID));

  const renderFolder = (folder: ImportFolderType) => {
    let flags = '';
    switch (folder.DropFolderType) {
      case 1:
        flags = 'Drop Source';
        break;
      case 2:
        flags = 'Drop Destination';
        break;
      case 3:
        flags = 'Both Drop Source and Destination';
        break;
      default:
    }
    if (folder.WatchForNewFiles) flags += folder.DropFolderType ? ', Watch For New Files' : 'Watch For New Files';

    return (
      <div key={folder.ID} className="flex flex-col mt-3 first:mt-0">
        <div className="flex justify-between">
          <span className="font-semibold">{flags}</span>
          <span className="text-highlight-2 font-semibold">Online</span>
        </div>
        <div className="mt-2">
          {folder.Path}
        </div>
        <div className="mt-1">
          Series: {folder.Size ?? 0} / Size: {prettyBytes(folder.FileSize ?? 0, { binary: true })}
        </div>
        <div className="mt-1 -ml-[0.313rem] flex">
          <Button onClick={() => rescanFolder(folder.ID)} tooltip="Rescan Folder">
            <Icon path={mdiDatabaseSearchOutline} size={1} horizontal vertical rotate={180} color="#279ceb" />
          </Button>
          <Button className="color-highlight-1" onClick={() => openImportFolderModalEdit(folder.ID)} tooltip="Edit Folder">
            <Icon path={mdiDatabaseEditOutline} size={1} horizontal vertical rotate={180} color="#279ceb" />
          </Button>
        </div>
      </div>

    );
  };

  return (
    <ShokoPanel title="Import Folders" isFetching={!hasFetched}>
      {importFolders.length === 0
        ? (<div className="flex justify-center font-bold mt-4" key="no-folders">No import folders added!</div>)
        : importFolders.map(importFolder => renderFolder(importFolder))}
    </ShokoPanel>
  );
}

export default ImportFolders;
