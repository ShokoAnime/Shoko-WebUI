import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { mdiDatabaseEditOutline, mdiDatabaseSearchOutline, mdiFolderPlusOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import { useRescanImportFolderMutation } from '@/core/react-query/import-folder/mutations';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import { setEdit, setStatus } from '@/core/slices/modals/importFolder';

import type { RootState } from '@/core/store';
import type { ImportFolderType } from '@/core/types/api/import-folder';

const Options = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('panels');
  return (
    <Button
      onClick={onClick}
      tooltip={t('importFolders.tooltip.addFolder')}
    >
      <Icon className="text-panel-icon-action" path={mdiFolderPlusOutline} size={1} />
    </Button>
  );
};

const ImportFolders = () => {
  const { t } = useTranslation('panels');
  const dispatch = useDispatch();

  const layoutEditMode = useSelector((state: RootState) => state.mainpage.layoutEditMode);

  const { mutate: rescanImportFolder } = useRescanImportFolderMutation();
  const importFolderQuery = useImportFoldersQuery();
  const importFolders = importFolderQuery?.data ?? [] as ImportFolderType[];

  const rescanFolder = (ID: number, name: string) => {
    rescanImportFolder(ID, {
      onSuccess: () =>
        toast.success(t('importFolders.toast.scanSuccess'), t('importFolders.toast.queued', { folderName: name })),
    });
  };
  const setImportFolderModalStatus = (status: boolean) => dispatch(setStatus(status));
  const openImportFolderModalEdit = (ID: number) => dispatch(setEdit(ID));

  const renderFolder = (folder: ImportFolderType) => {
    let flags = '';

    if (folder.DropFolderType === 'Both') flags = 'Source, Destination';
    else if (folder.DropFolderType !== 'None') flags = folder.DropFolderType ?? '';

    if (folder.WatchForNewFiles) flags += flags ? ', Watch' : 'Watch';

    return (
      <div key={folder.ID} className="flex flex-col border-t border-panel-border py-6 first:border-t-0">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold">{folder.Name}</span>
          <div className="flex">
            <Button
              onClick={() => rescanFolder(folder.ID, folder.Name)}
              tooltip={t('importFolders.tooltip.rescanFolder')}
              className="mr-2"
            >
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseSearchOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
            <Button
              onClick={() => openImportFolderModalEdit(folder.ID)}
              tooltip={t('importFolders.tooltip.editFolder')}
            >
              <Icon
                className="text-panel-icon-action"
                path={mdiDatabaseEditOutline}
                size={1}
                horizontal
                vertical
                rotate={180}
              />
            </Button>
          </div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">{t('importFolders.field.location')}</div>
          <div title={folder.Path} className="line-clamp-1 pl-2">{folder.Path}</div>
        </div>
        <div className="mb-1 flex">
          <div className="grow">{t('importFolders.field.type')}</div>
          <div>{flags !== '' ? flags : 'None'}</div>
        </div>
        <div className="flex">
          <div className="grow">{t('importFolders.field.size')}</div>
          <div>
            {prettyBytes(folder.FileSize ?? 0, { binary: true })}
            &nbsp;(
            {(folder.Size ?? 0).toLocaleString('en-US')}
            &nbsp;Series)
          </div>
        </div>
      </div>
    );
  };

  return (
    <ShokoPanel
      title={t('importFolders.panel.title')}
      options={<Options onClick={() => setImportFolderModalStatus(true)} />}
      isFetching={importFolderQuery.isPending}
      editMode={layoutEditMode}
      contentClassName={importFolders.length > 2 && ('pr-4')}
    >
      {importFolders.length === 0
        ? <div className="mt-4 flex justify-center font-semibold" key="no-folders">{t('importFolders.noFolders')}</div>
        : importFolders.map(importFolder => renderFolder(importFolder))}
    </ShokoPanel>
  );
};

export default ImportFolders;
