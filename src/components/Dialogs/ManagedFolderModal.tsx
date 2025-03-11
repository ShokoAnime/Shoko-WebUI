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
  useCreateManagedFolderMutation,
  useDeleteManagedFolderMutation,
  useUpdateManagedFolderMutation,
} from '@/core/react-query/managed-folder/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setStatus as setBrowseStatus } from '@/core/slices/modals/browseFolder';
import { setStatus } from '@/core/slices/modals/managedFolder';
import useEventCallback from '@/hooks/useEventCallback';

import BrowseFolderModal from './BrowseFolderModal';

import type { RootState } from '@/core/store';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';

const defaultManagedFolder = {
  WatchForNewFiles: false,
  DropFolderType: 'None',
  Path: '',
  Name: '',
  ID: 0,
} as ManagedFolderType;

function ManagedFolderModal() {
  const dispatch = useDispatch();

  const { ID, edit, status } = useSelector((state: RootState) => state.modals.managedFolder);

  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];

  const { isPending: isCreatePending, mutate: createFolder } = useCreateManagedFolderMutation();
  const { isPending: isDeletePending, mutate: deleteFolder } = useDeleteManagedFolderMutation();
  const { isPending: isUpdatePending, mutate: updateFolder } = useUpdateManagedFolderMutation();

  const [managedFolder, setManagedFolder] = useState(defaultManagedFolder);

  const getFolderDetails = () => {
    setManagedFolder(defaultManagedFolder);

    if (edit) {
      const folderDetails = find(managedFolders, { ID }) ?? {};
      setManagedFolder({ ...managedFolder, ...folderDetails });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = event.target.id;
    const value = name === 'WatchForNewFiles' ? event.target.value === '1' : event.target.value;
    setManagedFolder({ ...managedFolder, [name]: value });
  };

  const handleBrowse = () => dispatch(setBrowseStatus(true));
  const handleClose = useEventCallback(() => dispatch(setStatus(false)));

  const handleDelete = useEventCallback(() => {
    deleteFolder({ folderId: ID }, {
      onSuccess: () => {
        toast.success('Managed folder deleted!');
        dispatch(setStatus(false));
      },
    });
  });

  const handleSave = useEventCallback(() => {
    if (edit) {
      updateFolder(managedFolder, {
        onSuccess: () => {
          toast.success('Managed folder edited!');
          dispatch(setStatus(false));
        },
      });
    } else {
      createFolder(managedFolder, {
        onSuccess: () => {
          toast.success('Managed folder added!');
          dispatch(setStatus(false));
        },
      });
    }
  });

  const onFolderSelect = (Path: string) => setManagedFolder({ ...managedFolder, Path });
  const isLoading = isCreatePending || isDeletePending || isUpdatePending;

  return (
    <>
      <ModalPanel
        show={status}
        onRequestClose={handleClose}
        onAfterOpen={() => getFolderDetails()}
        header={edit ? 'Edit Managed Folder' : 'Add New Managed Folder'}
        size="sm"
        noPadding
      >
        <div>
          <div className="flex flex-col gap-y-6 p-6">
            <Input
              id="Name"
              value={managedFolder.Name}
              label="Name"
              type="text"
              placeholder="Folder name"
              onChange={handleInputChange}
              className="w-full"
            />
            <Input
              id="Path"
              value={managedFolder.Path}
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
              value={managedFolder.DropFolderType ?? 'None'}
              onChange={handleInputChange}
              className="w-full"
            >
              <option value="None">None</option>
              <option value="Source">Source</option>
              <option value="Destination">Destination</option>
              <option value="Both">Both</option>
            </Select>
            <Select
              label="Watch For New Files"
              id="WatchForNewFiles"
              value={managedFolder.WatchForNewFiles ? 1 : 0}
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
                disabled={managedFolder.Name === '' || managedFolder.Path === '' || isLoading}
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

export default ManagedFolderModal;
