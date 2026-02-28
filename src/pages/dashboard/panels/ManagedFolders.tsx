import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiDatabaseEditOutline, mdiDatabaseSearchOutline, mdiFolderPlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useRescanManagedFolderMutation } from '@/core/react-query/managed-folder/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setEdit, setStatus } from '@/core/slices/modals/managedFolder';

import type { RootState } from '@/core/store';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';

const Options = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    tooltip="Add Folder"
  >
    <Icon className="text-panel-icon-action" path={mdiFolderPlusOutline} size={1} />
  </Button>
);

const ManagedFolders = () => {
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { mutate: rescanManagedFolder } = useRescanManagedFolderMutation();
  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];

  const rescanFolder = (ID: number, name: string) => {
    rescanManagedFolder(ID, {
      onSuccess: () => toast.success('Scan Managed Folder Success', `Managed Folder ${name} queued for scanning.`),
    });
  };
  const setManagedFolderModalStatus = (status: boolean) => dispatch(setStatus(status));
  const openManagedFolderModalEdit = (ID: number) => dispatch(setEdit(ID));

  const renderFolder = (folder: ManagedFolderType) => {
    let flags = '';

    if (folder.DropFolderType === 'Both') flags = 'Source, Destination';
    else if (folder.DropFolderType !== 'None') flags = folder.DropFolderType ?? '';

    if (folder.WatchForNewFiles) flags += flags ? ', Watch' : 'Watch';

    return (
      <div key={folder.ID} className="flex flex-col border-t border-panel-border py-6 first:border-t-0">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold">{folder.Name}</span>
          <div className="flex">
            <Button onClick={() => rescanFolder(folder.ID, folder.Name)} tooltip="Rescan Folder" className="mr-2">
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseSearchOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
            <Button onClick={() => openManagedFolderModalEdit(folder.ID)} tooltip="Edit Folder">
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseEditOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
          </div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">Location</div>
          <div title={folder.Path} className="line-clamp-1 pl-2">{folder.Path}</div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">Type</div>
          <div>{flags !== '' ? flags : 'None'}</div>
        </div>
        <div className="flex">
          <div className="grow">Size</div>
          <div>
            {prettyBytes(folder.FileSize ?? 0, { binary: true })}
            &nbsp;(
            {(folder.Size ?? 0).toLocaleString('en-US')}
            &nbsp;Series)
          </div>
        </div>
      </div>
    );
  };

  return (
    <ShokoPanel
      title="Managed Folders"
      options={<Options onClick={() => setManagedFolderModalStatus(true)} />}
      isFetching={managedFolderQuery.isPending}
      editMode={layoutEditMode}
      contentClassName={managedFolders.length > 2 && ('pr-4')}
    >
      {managedFolders.length === 0
        ? <div className="mt-4 flex justify-center font-semibold" key="no-folders">No Managed Folders Added!</div>
        : managedFolders.map(folder => renderFolder(folder))}
    </ShokoPanel>
  );
};

export default ManagedFolders;
