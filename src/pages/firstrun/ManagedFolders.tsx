import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { mdiMinusCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import ManagedFolderModal from '@/components/Dialogs/ManagedFolderModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import { useDeleteManagedFolderMutation } from '@/core/react-query/managed-folder/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import { setEdit as setFolderModalEdit, setStatus as setFolderModalStatus } from '@/core/slices/modals/managedFolder';

import Footer from './Footer';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

const Folder = (props: ManagedFolderType) => {
  const {
    DropFolderType,
    ID,
    Name,
    Path,
    WatchForNewFiles,
  } = props;

  const dispatch = useDispatch();
  const { mutate: deleteFolder } = useDeleteManagedFolderMutation();

  const handleDeleteFolder = (folderId: number) => {
    deleteFolder({ folderId }, {
      onSuccess: () => toast.success('Managed folder deleted!'),
    });
  };

  const flags = useMemo(() => {
    let tempFlags = '';

    if (DropFolderType === 'Both') tempFlags = 'Source, Destination';
    else if (DropFolderType !== 'None') tempFlags = DropFolderType ?? '';

    if (WatchForNewFiles) tempFlags += tempFlags ? ', Watch' : 'Watch';

    return tempFlags;
  }, [DropFolderType, WatchForNewFiles]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between font-semibold">
        {Name}
        <div className="flex gap-x-3">
          <Button onClick={() => dispatch(setFolderModalEdit(ID))}>
            <Icon path={mdiPencilCircleOutline} size={1} className="text-panel-text-primary" />
          </Button>
          <Button onClick={() => handleDeleteFolder(ID)}>
            <Icon path={mdiMinusCircleOutline} size={1} className="text-panel-text-danger" />
          </Button>
        </div>
      </div>
      <div className="mt-3.5 flex justify-between">
        Location
        <span>{Path}</span>
      </div>
      <div className="mt-1 flex justify-between">
        Type
        <span>{flags}</span>
      </div>
    </div>
  );
};

function ManagedFolders() {
  const dispatch = useDispatch();

  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];

  return (
    <>
      <title>First Run &gt; Managed Folders | Shoko</title>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6 overflow-y-auto">
        <div className="text-xl font-semibold">Managed Folders</div>
        <div className="text-justify">
          For Shoko to function correctly, at least one managed folder is required. However, you can add as many import
          folders as you desire. It&apos;s important to note that you can only select one folder to be the designated
          drop destination.
        </div>
        <div className="flex font-semibold">
          <Button onClick={() => dispatch(setFolderModalStatus(true))} buttonType="primary" className="px-6 py-2">
            Add Managed Folder
          </Button>
        </div>
        {managedFolders.length > 0
          ? (
            <>
              <div className="font-semibold">
                Current Managed Folders
              </div>
              <div className="flex max-h-80 flex-col gap-y-6 overflow-y-auto">
                {managedFolders.map(folder => <Folder key={folder.ID} {...folder} />)}
              </div>
            </>
          )
          : <div className="font-semibold">No Managed Folders Added</div>}
        <Footer nextPage="data-collection" saveFunction={() => dispatch(setFirstRunSaved('managed-folders'))} />
      </TransitionDiv>

      <ManagedFolderModal />
    </>
  );
}

export default ManagedFolders;
