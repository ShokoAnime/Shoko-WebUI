import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

import BrowseFolderModal from './BrowseFolderModal';

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
  const { t } = useTranslation('dialogs');
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
  const handleClose = () => dispatch(setStatus(false));

  const handleDelete = () => {
    deleteFolder({ folderId: ID }, {
      onSuccess: () => {
        toast.success(t('dialogs.importFolderModal.toastDeleted'));
        dispatch(setStatus(false));
      },
    });
  };

  const handleSave = () => {
    if (edit) {
      updateFolder(importFolder, {
        onSuccess: () => {
          toast.success(t('dialogs.importFolderModal.toastEdited'));
          dispatch(setStatus(false));
        },
      });
    } else {
      createFolder(importFolder, {
        onSuccess: () => {
          toast.success(t('dialogs.importFolderModal.toastAdded'));
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
        header={edit ? t('dialogs.importFolderModal.editHeader') : t('dialogs.importFolderModal.addHeader')}
        size="sm"
        noPadding
      >
        <div>
          <div className="flex flex-col gap-y-6 p-6">
            <Input
              id="Name"
              value={importFolder.Name}
              label={t('dialogs.importFolderModal.nameLabel')}
              type="text"
              placeholder={t('dialogs.importFolderModal.namePlaceholder')}
              onChange={handleInputChange}
              className="w-full"
            />
            <Input
              id="Path"
              value={importFolder.Path}
              label={t('dialogs.importFolderModal.locationLabel')}
              type="text"
              placeholder={t('dialogs.importFolderModal.locationPlaceholder')}
              onChange={handleInputChange}
              className="w-full"
              endIcons={[{ icon: mdiFolderOpen, onClick: handleBrowse }]}
            />
            <Select
              label={t('dialogs.importFolderModal.dropTypeLabel')}
              id="DropFolderType"
              value={importFolder.DropFolderType ?? 'None'}
              onChange={handleInputChange}
              className="w-full"
            >
              <option value="None">{t('dialogs.importFolderModal.dropNone')}</option>
              <option value="Source">{t('dialogs.importFolderModal.dropSource')}</option>
              <option value="Destination">{t('dialogs.importFolderModal.dropDestination')}</option>
              <option value="Both">{t('dialogs.importFolderModal.dropBoth')}</option>
            </Select>
            <Select
              label={t('dialogs.importFolderModal.watchLabel')}
              id="WatchForNewFiles"
              value={importFolder.WatchForNewFiles ? 1 : 0}
              onChange={handleInputChange}
              className="w-full"
            >
              <option value={0}>{t('dialogs.importFolderModal.watchNo')}</option>
              <option value={1}>{t('dialogs.importFolderModal.watchYes')}</option>
            </Select>
          </div>
          <div className="rounded-b-lg border-t border-panel-border bg-panel-background-alt p-6">
            <div className="flex justify-end gap-x-3 font-semibold">
              {edit && (
                <Button onClick={handleDelete} buttonType="danger" buttonSize="normal">
                  {t('dialogs.common.delete')}
                </Button>
              )}
              <Button onClick={handleClose} buttonType="secondary" buttonSize="normal">
                {t('dialogs.common.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                buttonType="primary"
                buttonSize="normal"
                disabled={importFolder.Name === '' || importFolder.Path === '' || isLoading}
              >
                {t('dialogs.common.save')}
              </Button>
            </div>
          </div>
        </div>
      </ModalPanel>
      <BrowseFolderModal onSelect={onFolderSelect} />
    </>
  );
};

export default ImportFolderModal;
