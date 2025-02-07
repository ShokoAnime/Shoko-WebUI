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
  DropFolderType: 'Excluded',
  Path: '',
  Name: '',
  ID: 0,
} as ImportFolderType;

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
        header={edit ? 'Edit Import Folder' : 'Add New Import Folder'}
        size="sm"
        noPadding
      >
        <div>
          <div className="flex flex-col gap-y-6 p-6">
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
              value={importFolder.DropFolderType ?? 'Excluded'}
              onChange={handleInputChange}
              className="w-full"
            >
              <option value="Excluded">None</option>
              <option value="Source">Source</option>
              <option value="Destination">Destination</option>
              <option value="Both">Both</option>
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
          </div>
          <div className="rounded-b-lg border-t border-panel-border bg-panel-background-alt p-6">
            <div className="flex justify-end gap-x-3 font-semibold">
              {edit && (
                <Button onClick={handleDelete} buttonType="danger" buttonSize="normal">
                  Delete
                </Button>
              )}
              <Button onClick={handleClose} buttonType="secondary" buttonSize="normal">Cancel</Button>
              <Button
                onClick={handleSave}
                buttonType="primary"
                buttonSize="normal"
                disabled={importFolder.Name === '' || importFolder.Path === '' || isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </ModalPanel>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </>
  );
}

export default ImportFolderModal;
