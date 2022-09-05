import React from 'react';
import { useDispatch } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import {
  mdiDatabaseEditOutline,
  mdiDatabaseSearchOutline,
  mdiFolderPlusOutline,
} from '@mdi/js';

import toast from '../../../components/Toast';
import Button from '../../../components/Input/Button';
import { setEdit, setStatus } from '../../../core/slices/modals/importFolder';

import type { ImportFolderType } from '../../../core/types/api/import-folder';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { Icon } from '@mdi/react';
import { useGetImportFoldersQuery, useLazyRescanImportFolderQuery } from '../../../core/rtkQuery/importFolderApi';

function ImportFolders() {
  const dispatch = useDispatch();

  const [rescanTrigger] = useLazyRescanImportFolderQuery();
  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const rescanFolder = (ID: number, name: string) => {
    toast.success('Scan Import Folder Success', `Import Folder ${name} queued for scanning.`);
    rescanTrigger(ID).catch(() => {});
  };
  const setImportFolderModalStatus = (status: boolean) => dispatch(setStatus(status));
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
          <Button onClick={() => rescanFolder(folder.ID, folder.Name)} tooltip="Rescan Folder">
            <Icon className="text-highlight-1" path={mdiDatabaseSearchOutline} size={1} horizontal vertical rotate={180}/>
          </Button>
          <Button onClick={() => openImportFolderModalEdit(folder.ID)} tooltip="Edit Folder">
            <Icon className="text-highlight-1" path={mdiDatabaseEditOutline} size={1} horizontal vertical rotate={180}/>
          </Button>
        </div>
      </div>
    );
  };

  const renderOptions = () => (
    <div className="mx-2 cursor-pointer" onClick={() => setImportFolderModalStatus(true)} title="Add Folder">
        <Icon className="text-highlight-1" path={mdiFolderPlusOutline} size={1} horizontal vertical rotate={180}/>
    </div>
  );

  return (
    <ShokoPanel title="Import Folders" options={renderOptions()} isFetching={importFolderQuery.isFetching}>
      {importFolders.length === 0
        ? (<div className="flex justify-center font-bold mt-4" key="no-folders">No import folders added!</div>)
        : importFolders.map(importFolder => renderFolder(importFolder))}
    </ShokoPanel>
  );
}

export default ImportFolders;
