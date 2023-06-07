import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiMinusCircleOutline, mdiPencilCircleOutline } from '@mdi/js';

import toast from '@/components/Toast';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import Button from '@/components/Input/Button';
import type { ImportFolderType } from '@/core/types/api/import-folder';
import TransitionDiv from '@/components/TransitionDiv';
import { useDeleteImportFolderMutation, useGetImportFoldersQuery } from '@/core/rtkQuery/splitV3Api/importFolderApi';
import {
  setEdit as setImportFolderModalEdit,
  setStatus as setImportFolderModalStatus,
} from '@/core/slices/modals/importFolder';
import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import Footer from './Footer';

const Folder = (props: ImportFolderType) => {
  const {
    DropFolderType, ID, Name, Path, WatchForNewFiles,
  } = props;

  const dispatch = useDispatch();
  const [deleteFolder] = useDeleteImportFolderMutation();

  const handleDeleteFolder = async (folderId) => {
    // TODO: can this be better typed?
    const result: any = await deleteFolder({ folderId });
    if (!result.error) {
      toast.success('Import folder deleted!');
    }
  };

  const flags = useMemo(() => {
    let tempFlags = '';
    switch (DropFolderType) {
      case 1:
        tempFlags = 'Source';
        break;
      case 2:
        tempFlags = 'Destination';
        break;
      case 3:
        tempFlags = 'Source, Destination';
        break;
      default:
    }
    if (WatchForNewFiles) {
      tempFlags += DropFolderType ? ', Watch' : 'Watch';
    }
    return tempFlags;
  }, [DropFolderType, WatchForNewFiles]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between font-semibold">
        {Name}
        <div className="flex gap-x-3">
          <Button onClick={() => dispatch(setImportFolderModalEdit(ID))}>
            <Icon path={mdiPencilCircleOutline} size={1} className="text-highlight-1" />
          </Button>
          <Button onClick={() => handleDeleteFolder(ID)}>
            <Icon path={mdiMinusCircleOutline} size={1} className="text-highlight-3" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between mt-3.5">
        Location
        <span>{Path}</span>
      </div>
      <div className="flex justify-between mt-1">
        Type
        <span>{flags}</span>
      </div>
    </div>
  );
};

function ImportFolders() {
  const dispatch = useDispatch();

  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  return (
    <>
      <TransitionDiv className="flex flex-col justify-center overflow-y-auto max-w-[38rem] gap-y-8">
        <div className="font-semibold text-xl">Import Folders</div>
        <div className="text-justify">
          For Shoko to function correctly, at least one import folder is required. However, you can add as many import
          folders as you desire. It's important to note that you can only select one folder to be the designated drop
          destination.
        </div>
        <div className="flex font-semibold">
          <Button onClick={() => dispatch(setImportFolderModalStatus(true))} className="bg-highlight-1 py-2 px-8">
            Add Import Folder
          </Button>
        </div>
        {importFolders.length > 0 ? (
          <>
            <div className="font-semibold">
              Current Import Folders
            </div>
            <div className="flex flex-col gap-y-8 max-h-[20rem] overflow-y-auto">
              {importFolders.map(folder => <Folder {...folder} key={folder.ID} />)}
            </div>
          </>
        ) : (
          <div className="font-semibold">No Import Folders Added</div>
        )}
        <Footer nextPage="data-collection" saveFunction={() => dispatch(setFirstRunSaved('import-folders'))} />
      </TransitionDiv>

      <ImportFolderModal />
    </>
  );
}

export default ImportFolders;
