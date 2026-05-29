import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiFolderOpen } from '@mdi/js';
import { find } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
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

import BrowseFolderModal from './BrowseFolderModal';
import ConfirmationPromptModal from './ConfirmationPromptModal';

import type { RootState } from '@/core/store';
import type { ImportFolderType } from '@/core/types/api/import-folder';

const defaultImportFolder = {
  WatchForNewFiles: false,
  DropFolderType: 'None',
  Path: '',
  Name: '',
  ID: 0,
} as ImportFolderType;

const ImportFolderModal = () => {
  const dispatch = useDispatch();

  const { ID, edit, status } = useSelector((state: RootState) => state.modals.importFolder);

  const importFolderQuery = useImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const { isPending: isCreatePending, mutate: createFolder } = useCreateImportFolderMutation();
  const { isPending: isDeletePending, mutateAsync: deleteFolder } = useDeleteImportFolderMutation();
  const { isPending: isUpdatePending, mutate: updateFolder } = useUpdateImportFolderMutation();

  const [importFolder, setImportFolder] = useState(defaultImportFolder);
  const [keepAssociatedFileRecords, setKeepAssociatedFileRecords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getFolderDetails = () => {
    setImportFolder(defaultImportFolder);
    setKeepAssociatedFileRecords(false);
    setShowDeleteConfirm(false);

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
  const handleClose = () => dispatch(setStatus(false));

  const handleDelete = async () => {
    if (!ID) return;
    await deleteFolder({ folderId: ID, removeRecords: !keepAssociatedFileRecords })
      .then(() => {
        toast.success('Import folder deleted!');
        dispatch(setStatus(false));
      })
      .catch(() => {
        toast.error('Failed to delete import folder.');
      });
  };

  const handleSave = () => {
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
  };

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
              value={importFolder.DropFolderType ?? 'None'}
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
                <Button onClick={() => setShowDeleteConfirm(true)} buttonType="danger" buttonSize="normal">
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
      <ConfirmationPromptModal
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        show={showDeleteConfirm}
        title="Delete Import Folder"
        confirmButtonType="danger"
        confirmText="Delete"
      >
        <div>
          Are you sure you want to delete the import folder&nbsp;
          <span className="font-semibold text-panel-text-important">{importFolder.Name}</span>
          ?
        </div>
        <div className="flex flex-col gap-y-1 rounded-lg border border-panel-border bg-panel-background-alt p-4">
          <div className="text-sm opacity-65">Location</div>
          <div className="break-all text-panel-text-important">{importFolder.Path}</div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Checkbox
            id="keep-associated-file-records"
            isChecked={keepAssociatedFileRecords}
            onChange={event => setKeepAssociatedFileRecords(event.target.checked)}
            label="Keep associated file records"
            labelRight
          />
          <div className="text-sm opacity-65">
            Keep VideoLocals, DuplicateFiles, and related records for this folder. Use this when migrating files to a
            new location.
          </div>
        </div>
      </ConfirmationPromptModal>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </>
  );
};

export default ImportFolderModal;
