import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiFolderOpen } from '@mdi/js';
import { find } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import {
  useCreateImportFolderMutation,
  useDeleteImportFolderMutation,
  useUpdateImportFolderMutation,
} from '@/core/react-query/import-folder/mutations';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { setStatus as setBrowseStatus } from '@/core/slices/modals/browseFolder';
import { setStatus } from '@/core/slices/modals/importFolder';
import useEventCallback from '@/hooks/useEventCallback';

import BrowseFolderModal from './BrowseFolderModal';

import type { RootState } from '@/core/store';
import type { ImportFolderType } from '@/core/types/api/import-folder';

const defaultImportFolder = {
  WatchForNewFiles: false,
  DropFolderType: 0 as 0 | 1 | 2 | 3,
  Path: '',
  Name: '',
  ID: 0,
};

function ImportFolderModal() {
  const dispatch = useDispatch();

  const { ID, edit, status } = useSelector((state: RootState) => state.modals.importFolder);

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const { isPending: isCreatePending, mutate: createFolder } = useCreateImportFolderMutation();
  const { isPending: isDeletePending, mutate: deleteFolder } = useDeleteImportFolderMutation();
  const { isPending: isUpdatePending, mutate: updateFolder } = useUpdateImportFolderMutation();

  const [importFolder, setImportFolder] = useState(defaultImportFolder);

  const getFolderDetails = () => {
    setImportFolder(defaultImportFolder);

    if (edit) {
      const folderDetails = find(importFolders, { ID }) ?? {};
      setImportFolder({ ...importFolder, ...folderDetails });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = event.target.id;
    const value = name === 'WatchForNewFiles' ? event.target.value === '1' : event.target.value;
    setImportFolder({ ...importFolder, [name]: value });
  };

  const handleBrowse = () => dispatch(setBrowseStatus(true));
  const handleClose = useEventCallback(() => dispatch(setStatus(false)));

  const handleDelete = useEventCallback(() => {
    deleteFolder({ folderId: ID }, {
      onSuccess: () => {
        toast.success('Import folder deleted!');
        dispatch(setStatus(false));
      },
    });
  });

  const handleSave = useEventCallback(() => {
    if (edit) {
      updateFolder(importFolder, {
        onSuccess: () => {
          toast.success('Import folder edited!');
          dispatch(setStatus(false));
        },
      });
    } else {
      createFolder(importFolder, {
        onSuccess: () => {
          toast.success('Import folder added!');
          dispatch(setStatus(false));
        },
      });
    }
  });

  const onFolderSelect = (Path: string) => setImportFolder({ ...importFolder, Path });
  const isLoading = isCreatePending || isDeletePending || isUpdatePending;

  return (
    <>
      <ModalPanel
        show={status}
        onRequestClose={handleClose}
        onAfterOpen={() => getFolderDetails()}
        title={edit ? 'Edit Import Folder' : 'Add New Import Folder'}
        size="sm"
        titleLeft
      >
        <Input
          id="Name"
          value={importFolder.Name}
          label="Name"
          type="text"
          placeholder="Folder name"
          onChange={handleInputChange}
          className="w-full"
        />
        <Input
          id="Path"
          value={importFolder.Path}
          label="Location"
          type="text"
          placeholder="Location"
          onChange={handleInputChange}
          className="w-full"
          endIcons={[{ icon: mdiFolderOpen, onClick: handleBrowse }]}
        />
        <Select
          label="Drop Type"
          id="DropFolderType"
          value={importFolder.DropFolderType}
          onChange={handleInputChange}
          className="w-full"
        >
          <option value={0}>None</option>
          <option value={1}>Source</option>
          <option value={2}>Destination</option>
          <option value={3}>Both</option>
        </Select>
        <Select
          label="Watch For New Files"
          id="WatchForNewFiles"
          value={importFolder.WatchForNewFiles ? 1 : 0}
          onChange={handleInputChange}
          className="w-full"
        >
          <option value={0}>No</option>
          <option value={1}>Yes</option>
        </Select>
        <div className="flex justify-end gap-x-3 font-semibold">
          {edit && <Button onClick={handleDelete} buttonType="danger" className="px-6 py-2">Delete</Button>}
          <Button onClick={handleClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button
            onClick={handleSave}
            buttonType="primary"
            className="px-6 py-2"
            disabled={importFolder.Name === '' || importFolder.Path === '' || isLoading}
          >
            Save
          </Button>
        </div>
      </ModalPanel>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </>
  );
}

export default ImportFolderModal;
