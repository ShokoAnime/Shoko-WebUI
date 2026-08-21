import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiFolderOpen } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import {
  useCreateManagedFolderMutation,
  useDeleteManagedFolderMutation,
  useUpdateManagedFolderMutation,
} from '@/core/react-query/managed-folder/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setStatus as setBrowseStatus } from '@/core/slices/modals/browseFolder';
import { setStatus } from '@/core/slices/modals/managedFolder';
import { useDispatch, useSelector } from '@/core/store';
import toast from '@/core/toast';

import BrowseFolderModal from './BrowseFolderModal';
import ConfirmationPromptModal from './ConfirmationPromptModal';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

const defaultManagedFolder = {
  WatchForNewFiles: false,
  DropFolderType: 'None',
  Path: '',
  Name: '',
  ID: 0,
} as ManagedFolderType;

type DeleteMode = 'remove-records' | 'keep-records';

type DeleteModeOptionProps = {
  description: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  title: string;
};

const DeleteModeOption = ({ description, isSelected, onSelect, title }: DeleteModeOptionProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onSelect}
    className={cx(
      'flex cursor-pointer gap-x-2 rounded-lg border p-4 text-left transition ease-in-out',
      isSelected
        ? 'border-panel-text-primary bg-panel-background-alt'
        : 'border-panel-border hover:bg-panel-background-alt',
    )}
  >
    <Icon
      className="shrink-0 text-panel-icon-action"
      path={isSelected ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline}
      size={1}
    />
    <div className="flex flex-col gap-y-1">
      <div className="font-semibold">{title}</div>
      <div className="text-sm opacity-65">{description}</div>
    </div>
  </button>
);

const ManagedFolderModal = () => {
  const dispatch = useDispatch();

  const { ID, edit, status } = useSelector(state => state.modals.managedFolder);

  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];

  const { isPending: isCreatePending, mutate: createFolder } = useCreateManagedFolderMutation();
  const { isPending: isDeletePending, mutateAsync: deleteFolder } = useDeleteManagedFolderMutation();
  const { isPending: isUpdatePending, mutate: updateFolder } = useUpdateManagedFolderMutation();

  const [managedFolder, setManagedFolder] = useState(defaultManagedFolder);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('keep-records');
  const [removeFromMyList, setRemoveFromMyList] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getFolderDetails = () => {
    setManagedFolder(defaultManagedFolder);
    setDeleteMode('keep-records');
    setRemoveFromMyList(true);
    setShowDeleteConfirm(false);

    if (edit) {
      const folderDetails = find(managedFolders, { ID }) ?? {};
      setManagedFolder({ ...managedFolder, ...folderDetails });
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = event.target.id;
    const value = name === 'WatchForNewFiles' ? event.target.value === '1' : event.target.value;
    setManagedFolder({ ...managedFolder, [name]: value });
  };

  const handleBrowse = () => dispatch(setBrowseStatus(true));
  const handleClose = () => dispatch(setStatus(false));

  const handleDelete = async () => {
    if (!ID) return;
    const removeRecords = deleteMode === 'remove-records';
    await deleteFolder({ folderId: ID, removeRecords, ...(removeRecords && { skipEvents: !removeFromMyList }) })
      .then(() => {
        toast.success('Managed folder deleted!');
        dispatch(setStatus(false));
      })
      .catch(() => {
        toast.error('Failed to delete managed folder.');
      });
  };

  const handleSave = () => {
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
  };

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
                <Button onClick={() => setShowDeleteConfirm(true)} buttonType="danger" buttonSize="normal">
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
      <ConfirmationPromptModal
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        show={showDeleteConfirm}
        title="Delete Managed Folder"
        confirmButtonType={deleteMode === 'remove-records' ? 'danger' : 'primary'}
        confirmText={deleteMode === 'remove-records' ? 'Delete Records' : 'Remove Folder Only'}
      >
        <div>
          You are about to stop managing&nbsp;
          <span className="font-semibold text-panel-text-important">{managedFolder.Name}</span>
          . Nothing on your disk is deleted &mdash; only what Shoko remembers about these files changes.
        </div>
        <div className="flex flex-col gap-y-1 rounded-lg border border-panel-border bg-panel-background-alt p-4">
          <div className="text-sm opacity-65">Location</div>
          <div className="break-all text-panel-text-important">{managedFolder.Path}</div>
        </div>
        <div className="flex flex-col gap-y-3" role="radiogroup" aria-label="What to do with the file records">
          <DeleteModeOption
            title="The files only moved"
            description="Keeps every file record. Pick this for a new drive letter, a renamed path, or a migration, then add the new location so your collection re-links without re-hashing."
            isSelected={deleteMode === 'keep-records'}
            onSelect={() => setDeleteMode('keep-records')}
          />
          <DeleteModeOption
            title="The files are gone for good"
            description="Shoko forgets every file here: episode matches, watched state, resume position, and stored hashes. Files that also live in another managed folder are kept."
            isSelected={deleteMode === 'remove-records'}
            onSelect={() => setDeleteMode('remove-records')}
          />
        </div>
        {deleteMode === 'keep-records' && (
          <div className="text-sm opacity-65">
            Changed your mind later? Run&nbsp;
            <span className="font-semibold text-panel-text-important">Remove Missing Files</span>
            &nbsp;from the Actions menu to clear out records whose files are no longer accessible, or&nbsp;
            <span className="font-semibold text-panel-text-important">Remove Missing Files (Keep in MyList)</span>
            &nbsp;to do the same without touching your AniDB MyList.
          </div>
        )}
        {deleteMode === 'remove-records' && (
          <div className="flex flex-col gap-y-2">
            <Checkbox
              id="remove-from-mylist"
              isChecked={removeFromMyList}
              onChange={event => setRemoveFromMyList(event.target.checked)}
              label="Also remove these files from your AniDB MyList"
              labelRight
            />
            <div className="text-sm opacity-65">
              This cannot be undone by re-adding the folder. Uncheck it to leave your MyList untouched.
            </div>
          </div>
        )}
      </ConfirmationPromptModal>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </>
  );
};

export default ManagedFolderModal;
