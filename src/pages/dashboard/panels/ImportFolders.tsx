import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { mdiDatabaseEditOutline, mdiDatabaseSearchOutline, mdiFolderPlusOutline } from '@mdi/js';

import { RootState } from '@/core/store';
import toast from '@/components/Toast';
import Button from '@/components/Input/Button';
import { setEdit, setStatus } from '@/core/slices/modals/importFolder';

import type { ImportFolderType } from '@/core/types/api/import-folder';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { Icon } from '@mdi/react';
import { useGetImportFoldersQuery, useLazyRescanImportFolderQuery } from '@/core/rtkQuery/splitV3Api/importFolderApi';

function ImportFolders() {
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

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
        flags = 'Source';
        break;
      case 2:
        flags = 'Destination';
        break;
      case 3:
        flags = 'Source, Destination';
        break;
      default:
    }
    if (folder.WatchForNewFiles) flags += folder.DropFolderType ? ', Watch' : 'Watch';

    return (
      <div key={folder.ID} className="flex flex-col mt-6 first:mt-0">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">{folder.Name}</span>
          <div className="flex">
            <Button onClick={() => rescanFolder(folder.ID, folder.Name)} tooltip="Rescan Folder" className="mr-2">
              <Icon className="text-panel-primary" path={mdiDatabaseSearchOutline} size={1} horizontal vertical rotate={180} />
            </Button>
            <Button onClick={() => openImportFolderModalEdit(folder.ID)} tooltip="Edit Folder">
              <Icon className="text-panel-primary" path={mdiDatabaseEditOutline} size={1} horizontal vertical rotate={180} />
            </Button>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex-grow">Location</div>
          <div>{folder.Path}</div>
        </div>
        <div className="flex mb-1">
          <div className="flex-grow">Type</div>
          <div>{flags}</div>
        </div>
        <div className="flex">
          <div className="grow">Size</div>
          <div>{prettyBytes(folder.FileSize ?? 0, { binary: true })} ({(folder.Size ?? 2043).toLocaleString('en-US')} Series)</div>
        </div>
      </div>
    );
  };

  const renderOptions = () => (
    <div className="cursor-pointer" onClick={() => setImportFolderModalStatus(true)} title="Add Folder">
      <Icon className="text-panel-primary" path={mdiFolderPlusOutline} size={1} horizontal vertical rotate={180} />
    </div>
  );

  return (
    <ShokoPanel title="Import Folders" options={renderOptions()} isFetching={importFolderQuery.isLoading} editMode={layoutEditMode}>
      {importFolders.length === 0
        ? (<div className="flex justify-center font-semibold mt-4" key="no-folders">No Import Folders Added!</div>)
        : importFolders.map(importFolder => renderFolder(importFolder))}
    </ShokoPanel>
  );
}

export default ImportFolders;
