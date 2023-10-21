import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { mdiMinusCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import { useDeleteImportFolderMutation, useGetImportFoldersQuery } from '@/core/rtkQuery/splitV3Api/importFolderApi';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import {
  setEdit as setImportFolderModalEdit,
  setStatus as setImportFolderModalStatus,
} from '@/core/slices/modals/importFolder';
import { isErrorWithMessage } from '@/core/util';

import Footer from './Footer';

import type { ImportFolderType } from '@/core/types/api/import-folder';

const Folder = (props: ImportFolderType) => {
  const {
    DropFolderType,
    ID,
    Name,
    Path,
    WatchForNewFiles,
  } = props;

  const dispatch = useDispatch();
  const [deleteFolder] = useDeleteImportFolderMutation();

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder({ folderId });
      toast.success('Import folder deleted!');
    } catch (err) {
      if (isErrorWithMessage(err)) {
        console.error(err.message);
      }
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

function ImportFolders() {
  const dispatch = useDispatch();

  const importFolderQuery = useGetImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  return (
    <>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-8 overflow-y-auto">
        <div className="text-xl font-semibold">Import Folders</div>
        <div className="text-justify">
          For Shoko to function correctly, at least one import folder is required. However, you can add as many import
          folders as you desire. It&apos;s important to note that you can only select one folder to be the designated
          drop destination.
        </div>
        <div className="flex font-semibold">
          <Button onClick={() => dispatch(setImportFolderModalStatus(true))} buttonType="primary" className="px-8 py-2">
            Add Import Folder
          </Button>
        </div>
        {importFolders.length > 0
          ? (
            <>
              <div className="font-semibold">
                Current Import Folders
              </div>
              <div className="flex max-h-[20rem] flex-col gap-y-8 overflow-y-auto">
                {importFolders.map(folder => <Folder {...folder} key={folder.ID} />)}
              </div>
            </>
          )
          : <div className="font-semibold">No Import Folders Added</div>}
        <Footer nextPage="data-collection" saveFunction={() => dispatch(setFirstRunSaved('import-folders'))} />
      </TransitionDiv>

      <ImportFolderModal />
    </>
  );
}

export default ImportFolders;
