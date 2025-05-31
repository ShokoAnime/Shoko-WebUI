import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { mdiMinusCircleOutline, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import ImportFolderModal from '@/components/Dialogs/ImportFolderModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import TransitionDiv from '@/components/TransitionDiv';
import { useDeleteImportFolderMutation } from '@/core/react-query/import-folder/mutations';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { setSaved as setFirstRunSaved } from '@/core/slices/firstrun';
import {
  setEdit as setImportFolderModalEdit,
  setStatus as setImportFolderModalStatus,
} from '@/core/slices/modals/importFolder';

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
  const { mutate: deleteFolder } = useDeleteImportFolderMutation();

  const handleDeleteFolder = (folderId: number) => {
    deleteFolder({ folderId }, {
      onSuccess: () => toast.success('Import folder deleted!'),
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

const ImportFolders = () => {
  const dispatch = useDispatch();

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  return (
    <>
      <title>First Run &gt; Import Folders | Shoko</title>
      <TransitionDiv className="flex max-w-[38rem] flex-col justify-center gap-y-6 overflow-y-auto">
        <div className="text-xl font-semibold">Import Folders</div>
        <div className="text-justify">
          For Shoko to function correctly, at least one import folder is required. However, you can add as many import
          folders as you desire. It&apos;s important to note that you can only select one folder to be the designated
          drop destination.
        </div>
        <div className="flex font-semibold">
          <Button onClick={() => dispatch(setImportFolderModalStatus(true))} buttonType="primary" className="px-6 py-2">
            Add Import Folder
          </Button>
        </div>
        {importFolders.length > 0
          ? (
            <>
              <div className="font-semibold">
                Current Import Folders
              </div>
              <div className="flex max-h-80 flex-col gap-y-6 overflow-y-auto">
                {importFolders.map(folder => <Folder key={folder.ID} {...folder} />)}
              </div>
            </>
          )
          : <div className="font-semibold">No Import Folders Added</div>}
        <Footer nextPage="data-collection" saveFunction={() => dispatch(setFirstRunSaved('import-folders'))} />
      </TransitionDiv>

      <ImportFolderModal />
    </>
  );
};

export default ImportFolders;
