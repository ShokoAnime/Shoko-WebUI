import React from 'react';
import { useDispatch } from 'react-redux';
import { mdiDatabaseEditOutline, mdiDatabaseSearchOutline, mdiFolderPlusOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { produce } from 'immer';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import toast from '@/components/Toast';
import { useRescanManagedFolderMutation } from '@/core/react-query/managed-folder/mutations';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import { setEdit, setStatus } from '@/core/slices/modals/managedFolder';
import useEventCallback from '@/hooks/useEventCallback';
import useSettingsContext from '@/hooks/useSettingsContext';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

function ImportSettings() {
  const dispatch = useDispatch();
  const { newSettings, updateSetting } = useSettingsContext();
  const { mutate: rescanManagedFolder } = useRescanManagedFolderMutation();
  const managedFolderQuery = useManagedFoldersQuery();
  const managedFolders = managedFolderQuery?.data ?? [] as ManagedFolderType[];

  const handleAddButton = useEventCallback(() => {
    dispatch(setStatus(true));
  });

  const handleRescanButton = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = parseInt(event.currentTarget.id.slice(0, -'-rescan'.length), 10);
    const folder = managedFolders.find(fold => fold.ID === id);
    rescanManagedFolder(id, {
      onSuccess: () =>
        toast.success(
          'Scan Managed Folder Success',
          `Managed Folder ${folder?.Name ?? '<unknown>'} queued for scanning.`,
        ),
    });
  });

  const handleEditButton = useEventCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const id = parseInt(event.currentTarget.id.slice(0, -'-edit'.length), 10);
    dispatch(setEdit(id));
  });

  const {
    AutomaticallyDeleteDuplicatesOnImport,
    RunOnStart,
    UseExistingFileWatchedStatus,
    VideoExtensions,
  } = newSettings.Import;

  const {
    AllowRelocationInsideDestinationOnImport,
    MoveOnImport,
    RenameOnImport,
  } = newSettings.Plugins.Renamer;

  const handleRenamerSettingChange = useEventCallback(
    (type: 'MoveOnImport' | 'RenameOnImport' | 'AllowRelocationInsideDestinationOnImport', value: boolean) => {
      const renamerSettings = produce(newSettings.Plugins.Renamer, settings => ({
        ...settings,
        [type]: value,
      }));
      updateSetting('Plugins', 'Renamer', renamerSettings);
    },
  );

  return (
    <>
      <title>Settings &gt; Import | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Import</div>
        <div>
          Configure how Shoko imports files into your collection, specifying file types and enabling options for
          renaming and moving them as needed.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex items-center font-semibold">Import Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox
            justify
            label="Import on start"
            id="import-on-start"
            isChecked={RunOnStart}
            onChange={event => updateSetting('Import', 'RunOnStart', event.target.checked)}
          />
          <Checkbox
            justify
            label="Rename on import"
            id="rename-on-import"
            isChecked={RenameOnImport}
            onChange={event => handleRenamerSettingChange('RenameOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Move on import"
            id="move-on-import"
            isChecked={MoveOnImport}
            onChange={event => handleRenamerSettingChange('MoveOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Allow relocation inside destination on import"
            id="allow-relocation-inside-destination-on-import"
            isChecked={AllowRelocationInsideDestinationOnImport}
            onChange={event =>
              handleRenamerSettingChange('AllowRelocationInsideDestinationOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Delete duplicates on import"
            id="delete-duplicates-on-import"
            isChecked={AutomaticallyDeleteDuplicatesOnImport}
            onChange={event => updateSetting('Import', 'AutomaticallyDeleteDuplicatesOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Set file as watched if episode is watched"
            id="set-file-watched"
            isChecked={UseExistingFileWatchedStatus}
            onChange={event => updateSetting('Import', 'UseExistingFileWatchedStatus', event.target.checked)}
          />
          <div className="flex items-center justify-between">
            Video Extensions
            <InputSmall
              id="username"
              value={VideoExtensions.join(',')}
              type="text"
              onChange={event => updateSetting('Import', 'VideoExtensions', event.target.value.split(','))}
              className="w-64 px-3 py-1"
            />
          </div>
        </div>
      </div>
      <div className="border-b border-panel-border" />

      <div className="mt-0.5 flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Managed Folders</div>
          <Button onClick={handleAddButton} tooltip="Add Folder">
            <Icon
              className="text-panel-icon-action"
              path={mdiFolderPlusOutline}
              size={0.85}
            />
          </Button>
        </div>
        <div className="flex flex-col gap-y-1">
          {managedFolders.map((folder, index) => (
            <React.Fragment key={folder.ID}>
              {index !== 0 && <div className="border-b border-panel-border" />}

              <div className="flex flex-col py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold">{folder.Name}</span>
                  <div className="flex">
                    <Button
                      id={`${folder.ID}-rescan`}
                      onClick={handleRescanButton}
                      tooltip="Rescan Folder"
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
                    <Button id={`${folder.ID}-edit`} onClick={handleEditButton} tooltip="Edit Folder">
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
                  <div className="grow">Location</div>
                  <div title={folder.Path} className="line-clamp-1 pl-2">{folder.Path}</div>
                </div>
                <div className="mb-1 flex">
                  <div className="grow">Type</div>
                  <div>
                    {[
                      folder.DropFolderType === 'Both' ? 'Source, Destination' : '',
                      folder.DropFolderType !== 'Both' && folder.DropFolderType !== 'None' ? folder.DropFolderType : '',
                      folder.WatchForNewFiles ? 'Watch' : '',
                    ].filter(part => part).join(', ') || 'None'}
                  </div>
                </div>
                <div className="flex">
                  <div className="grow">Size</div>
                  <div>
                    {prettyBytes(folder.FileSize ?? 0, { binary: true })}
                    &nbsp;(
                    {(folder.Size ?? 0).toLocaleString('en-US')}
                    &nbsp;Series)
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="border-b border-panel-border" />
    </>
  );
}

export default ImportSettings;
