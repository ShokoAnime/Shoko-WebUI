import React, { useEffect, useEffectEvent, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import {
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCogOutline,
  mdiFileDocumentEditOutline,
  mdiHelpCircleOutline,
  mdiLoading,
  mdiMinusCircleMultipleOutline,
  mdiMinusCircleOutline,
  mdiPencilOutline,
  mdiPlusCircleOutline,
  mdiRefresh,
  mdiStarCircleOutline,
  mdiTrashCanOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { chunk, find, isEqual } from 'lodash';
import { useImmer } from 'use-immer';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import DynamicForm from '@/components/Dynamic/DynamicForm';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import AddFilesModal from '@/components/Utilities/Renamer/AddFilesModal';
import PresetModal from '@/components/Utilities/Renamer/PresetModal';
import RenamerScript from '@/components/Utilities/Renamer/RenamerScript';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import {
  useDeleteRelocationPresetMutation,
  useRelocationPreviewMutation,
  useRelocationRelocateMutation,
  useUpdateRelocationConfigurationMutation,
  useUpdateRelocationPresetMutation,
} from '@/core/react-query/relocation/mutations';
import {
  useRelocationConfigurationQuery,
  useRelocationPresetsQuery,
  useRelocationProviderQuery,
  useRelocationProvidersQuery,
} from '@/core/react-query/relocation/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { clearFiles, clearResults, removeFiles } from '@/core/slices/utilities/renamer';
import { useDispatch, useSelector } from '@/core/store';
import useRowSelection from '@/hooks/useRowSelection';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { FileType } from '@/core/types/api/file';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';
import type {
  RelocationConfigurationType,
  RelocationPresetType,
  RelocationResultType,
} from '@/core/types/api/relocation';

const getFileColumn = (managedFolders: ManagedFolderType[]) => ({
  id: 'filename',
  name: 'Original Filename',
  className: 'line-clamp-2 grow basis-0 overflow-hidden',
  item: (file) => {
    const path = file.Locations[0]?.RelativePath ?? '';
    const match = /[/\\](?=[^/\\]*$)/g.exec(path);
    const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
    const managedFolder = find(
      managedFolders,
      { ID: file?.Locations[0]?.ManagedFolderID ?? -1 },
    )?.Name ?? '<Unknown>';
    return (
      <div
        className="flex flex-col"
        data-tooltip-id="tooltip"
        data-tooltip-content={path}
        data-tooltip-delay-show={500}
      >
        <span className="line-clamp-1 text-sm font-semibold opacity-65">
          {`${managedFolder} - ${relativePath}`}
        </span>
        <span className="line-clamp-1 break-all">
          {path?.split(/[/\\]/g).pop()}
        </span>
      </div>
    );
  },
} as UtilityHeaderType<FileType>);

const getResultColumn = (
  renameResults: Record<number, RelocationResultType>,
  managedFolders: ManagedFolderType[],
) => ({
  id: 'result',
  name: 'Result',
  className: 'line-clamp-2 grow basis-0 overflow-hidden',
  item: (file) => {
    const result = renameResults[file.ID];
    if (!result) {
      return (
        <div>
          <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
        </div>
      );
    }

    if (result.ErrorMessage) {
      return (
        <div
          className="text-panel-text-danger"
          data-tooltip-id="tooltip"
          data-tooltip-content={result.ErrorMessage}
          data-tooltip-delay-show={500}
        >
          {result.ErrorMessage}
        </div>
      );
    }

    const path = result.RelativePath ?? '';
    const match = /[/\\](?=[^/\\]*$)/g.exec(path);
    const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
    const managedFolder = find(
      managedFolders,
      { ID: result.ManagedFolderID ?? -1 },
    )?.Name ?? '<Unknown>';
    const fileName = path ? path?.split(/[/\\]/g).pop() : 'No change!';

    return (
      <div
        className="flex flex-col"
        data-tooltip-id="tooltip"
        data-tooltip-content={path}
        data-tooltip-delay-show={500}
      >
        <span className="line-clamp-1 text-sm font-semibold opacity-65">
          {`${managedFolder} - ${relativePath}`}
        </span>
        <span className="line-clamp-1 break-all">
          {fileName}
        </span>
      </div>
    );
  },
} as UtilityHeaderType<FileType>);

const getStatusIcon = (result?: RelocationResultType, noChange = false) => {
  let icon = mdiHelpCircleOutline;
  let className = '';
  let tooltip = '';

  if (result?.ErrorMessage) {
    icon = mdiCloseCircleOutline;
    className = 'text-panel-text-danger';
    tooltip = 'Rename/preview failed!';
  } else if (noChange) {
    icon = mdiCheckCircleOutline;
    className = 'text-panel-text-important';
    tooltip = 'No change!';
  } else if (result?.IsSuccess && result?.IsPreview) {
    icon = mdiAlertCircleOutline;
    className = 'text-panel-text-warning';
    tooltip = 'Rename pending!';
  } else if (result?.IsSuccess) {
    icon = mdiCheckCircleOutline;
    className = 'text-panel-text-important';
    tooltip = 'Rename successful!';
  }

  return (
    <Icon
      path={icon}
      size={1}
      className={className}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-delay-show={0}
    />
  );
};

const getStatusColumn = (
  renameResults: Record<number, RelocationResultType>,
  managedFolders: ManagedFolderType[],
  moveFiles: boolean,
) => ({
  id: 'status',
  name: 'Status',
  className: 'w-16',
  item: (file) => {
    const result = renameResults[file.ID];
    let noChange = false;

    if (result) {
      const path = file.Locations[0]?.RelativePath ?? '';
      const match = /[/\\](?=[^/\\]*$)/g.exec(path);
      const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
      const managedFolder = find(
        managedFolders,
        { ID: file?.Locations[0]?.ManagedFolderID ?? -1 },
      )?.Name ?? '<Unknown>';

      const newPath = result.RelativePath ?? '';
      const newRelativePath = match ? newPath?.substring(0, match.index) : 'Root Level';
      const newManagedFolder = find(
        managedFolders,
        { ID: result?.ManagedFolderID ?? -1 },
      )?.Name ?? '<Unknown>';

      noChange = (path === newPath) && (!moveFiles
        || (managedFolder === newManagedFolder && relativePath === newRelativePath));
    }

    return (
      <div className="flex justify-center">
        {getStatusIcon(result, noChange)}
      </div>
    );
  },
} as UtilityHeaderType<FileType>);

type MenuProps = {
  disable: boolean;
  moveFiles: boolean;
  renameFiles: boolean;
  toggleMoveFiles: () => void;
  toggleRenameFiles: () => void;
  selectedRows: FileType[];
};

const Menu = React.memo((props: MenuProps) => {
  const { disable, moveFiles, renameFiles, selectedRows, toggleMoveFiles, toggleRenameFiles } = props;

  const dispatch = useDispatch();

  return (
    <div
      className={cx(
        'flex h-13 grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 transition-opacity',
        disable ? 'pointer-events-none opacity-65' : '',
      )}
    >
      <MenuButton
        onClick={() => dispatch(clearResults())}
        icon={mdiRefresh}
        name="Refresh"
      />
      <MenuButton
        onClick={() => dispatch(removeFiles(selectedRows.map(row => row.ID)))}
        icon={mdiMinusCircleOutline}
        name="Remove"
        disabled={!disable && selectedRows.length === 0}
      />
      <MenuButton
        onClick={() => dispatch(clearFiles())}
        icon={mdiMinusCircleMultipleOutline}
        name="Remove All"
      />
      <Checkbox
        id="move-files"
        isChecked={moveFiles}
        onChange={toggleMoveFiles}
        label="Move Files"
        labelRight
      />
      <Checkbox
        id="rename-files"
        isChecked={renameFiles}
        onChange={toggleRenameFiles}
        label="Rename Files"
        labelRight
      />
    </div>
  );
});

const PresetOption = ({ preset }: { preset: RelocationPresetType }) => {
  const renamersQuery = useRelocationProvidersQuery();

  const currentRenamer = find(renamersQuery.data, provider => provider.ID === preset.ProviderID);

  let presetName: string;
  if (renamersQuery.isPending) {
    presetName = 'Loading...';
  } else if (currentRenamer) {
    presetName = `${preset.Name} (${currentRenamer.Name} - ${currentRenamer.Version})`;
  } else {
    presetName = `${preset.Name} (<Unknown>)`;
  }

  return (
    <option value={preset.ID}>
      {presetName}
    </option>
  );
};

const Renamer = () => {
  const dispatch = useDispatch();
  const addedFiles = useSelector(state => state.utilities.renamer.files);
  const relocationResults = useSelector(state => state.utilities.renamer.results);

  const settings = useSettingsQuery().data;
  const managedFoldersQuery = useManagedFoldersQuery();
  const relocationPresetsQuery = useRelocationPresetsQuery();

  const defaultPreset = find(relocationPresetsQuery.data, preset => preset.IsDefault);

  const [newConfig, setNewConfig] = useImmer<RelocationConfigurationType | undefined>(undefined);

  const [selectedPreset, setSelectedPreset] = useState<RelocationPresetType>();

  const renamer = useRelocationProviderQuery(selectedPreset?.ProviderID ?? '', !!selectedPreset).data;
  const renamerHasConfig = !!renamer?.Configuration;

  const configQuery = useRelocationConfigurationQuery(
    selectedPreset?.ID ?? '',
    renamerHasConfig && !!selectedPreset,
  );

  useEffect(() => {
    if (!configQuery.data) return;
    setNewConfig(configQuery.data);
  }, [configQuery.data, setNewConfig]);

  const { isPending: isUpdatePresetPending, mutate: updatePreset } = useUpdateRelocationPresetMutation();
  const { isPending: isDeletePresetPending, mutate: deletePreset } = useDeleteRelocationPresetMutation();
  const { isPending: isSaveConfigPending, mutate: saveConfig } = useUpdateRelocationConfigurationMutation();
  const { isPending: previewPending, mutateAsync: previewRelocation } = useRelocationPreviewMutation();
  const { isPending: isRelocatePending, mutate: relocateFiles } = useRelocationRelocateMutation();

  const [moveFiles, toggleMoveFiles] = useToggle(settings.Plugins.Renamer.MoveOnImport);
  // In the case where move on import is not selected, we will assume the user wants to rename files when
  // they open this page. Otherwise, why are they here? In most cases, it would be for renaming.
  const [renameFiles, toggleRenameFiles] = useToggle(
    settings.Plugins.Renamer.MoveOnImport ? settings.Plugins.Renamer.RenameOnImport : true,
  );
  const [showSettings, toggleSettings] = useToggle(false);
  const [showAddFilesModal, toggleAddFilesModal] = useToggle(false);
  const [showPresetModal, togglePresetModal] = useToggle(false);
  const [presetRename, setPresetRename] = useState(false);

  const configEdited = !isEqual(configQuery.data, newConfig);

  const fetchPreviewPage = async (index: number) => {
    if (!renamer || (renamer.Configuration && !newConfig)) return;
    const pageSize = 20;
    const pageNumber = Math.floor(index / pageSize);
    const pendingPreviews = addedFiles
      .slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize,
      )
      .map(file => file.ID)
      .filter(fileId => !relocationResults[fileId]);

    if (pendingPreviews.length === 0 || !renamer) return;

    await previewRelocation({
      move: moveFiles,
      rename: renameFiles,
      FileIDs: pendingPreviews,
      ProviderID: renamer.ID,
      Configuration: newConfig,
    });
  };

  const changeSelectedPreset = (presetId: string) => {
    if (presetId === '') {
      setSelectedPreset(undefined);
      return;
    }

    if (!relocationPresetsQuery.isSuccess || !relocationPresetsQuery.data[0]) return;
    const tempPreset = relocationPresetsQuery.data.find(
      preset => preset.ID === presetId,
    ) ?? relocationPresetsQuery.data[0];

    if (!tempPreset) return;

    setSelectedPreset(tempPreset);
  };

  const changeSelectedPresetEvent = useEffectEvent((presetId: string) => changeSelectedPreset(presetId));

  // Handle the below 3 hooks with care. These are used for auto-updating previews on changes.
  // We combine them here because there is a delay in when the name changes and the config changes
  // Effect should only be triggered once even if both values change
  const [debouncedConfig] = useDebounceValue(newConfig, 500);
  const [initialClear, setInitialClear] = useState(true);
  useEffect(() => {
    if (!debouncedConfig) return;

    // To avoid clearing of rename results on render as it's already cleared from the other useEffect
    if (initialClear) {
      setInitialClear(false);
      return;
    }

    dispatch(clearResults());
    // initialClear is used to skip the effect on initial render, adding it to deps would cause the effect to run
    // an extra time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedConfig, dispatch]);

  const handleSaveConfig = () => {
    if (!selectedPreset) return;

    saveConfig({
      presetId: selectedPreset.ID,
      ...newConfig,
    }, {
      onSuccess: () => toast.success(`"${selectedPreset.Name}" saved successfully!`),
      onError: () => toast.error(`"${selectedPreset.Name}" could not be saved!`),
    });
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;

    deletePreset(selectedPreset.ID, {
      onSuccess: () => toast.success(`"${selectedPreset.Name}" deleted successfully!`),
      onError: () => toast.error(`"${selectedPreset.Name}" could not be deleted!`),
    });

    changeSelectedPreset(defaultPreset?.ID ?? relocationPresetsQuery.data?.[0]?.ID ?? '');
  };

  const handleSetAsDefault = () => {
    if (!selectedPreset) return;

    updatePreset({
      presetId: selectedPreset.ID,
      IsDefault: true,
    }, {
      onSuccess: () => toast.success(`${selectedPreset.Name} set as default preset!`),
      onError: error => toast.error('', error.message),
    });
  };

  const openPresetModal = (rename: boolean) => {
    setPresetRename(rename);
    togglePresetModal();
  };

  useEffect(() => {
    dispatch(clearResults());
  }, [dispatch, moveFiles, renameFiles]);

  useEffect(() => {
    if (!relocationPresetsQuery.isSuccess) return;

    if (selectedPreset) changeSelectedPresetEvent(selectedPreset.ID);
    else changeSelectedPresetEvent(defaultPreset?.ID ?? '');
    // This shouldn't run when `selectedConfig.Name` changes.
    // We are resetting `selectedConfig` when new data arrives so that it is up-to-date for `configEdited` flag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relocationPresetsQuery.data, relocationPresetsQuery.isSuccess, settings]);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(addedFiles);

  const columns = useMemo(() => {
    const managedFolders = managedFoldersQuery?.data ?? [];
    return [
      getFileColumn(managedFolders),
      getResultColumn(relocationResults, managedFolders),
      getStatusColumn(relocationResults, managedFolders, moveFiles),
    ];
  }, [managedFoldersQuery?.data, moveFiles, relocationResults]);

  const handleRename = () => {
    if (!selectedPreset || !addedFiles.length) return;

    // Split the files into chunks of 1000 to avoid API errors
    chunk(addedFiles, 1000).forEach((files) => {
      relocateFiles({
        presetId: selectedPreset.ID,
        move: moveFiles,
        rename: renameFiles,
        deleteEmptyDirectories: true,
        FileIDs: files.map(file => file.ID),
      });
    });
  };

  const [renameDisabled, renameDisabledReason] = useMemo(() => {
    if (isRelocatePending) return [true, 'Renaming in progress...'];
    if (configEdited) return [true, 'Config has been edited, please save before renaming files'];
    if (addedFiles.length === 0) return [true, 'No files added'];
    if (!moveFiles && !renameFiles) return [true, 'Neither rename nor move is selected. No action to be performed'];
    return [false, ''];
  }, [addedFiles.length, configEdited, moveFiles, isRelocatePending, renameFiles]);

  return (
    <>
      <title>File Renamer | Shoko</title>
      <div className="flex grow flex-col gap-y-3">
        <ShokoPanel title="File Rename">
          <div className="flex items-center gap-x-3">
            <Menu
              selectedRows={selectedRows}
              moveFiles={moveFiles}
              renameFiles={renameFiles}
              toggleMoveFiles={toggleMoveFiles}
              toggleRenameFiles={toggleRenameFiles}
              disable={isRelocatePending}
            />
            <div className="flex gap-x-3">
              <Button
                buttonType="secondary"
                buttonSize="normal"
                className="flex h-13 items-center"
                onClick={toggleSettings}
                disabled={!relocationPresetsQuery.isSuccess}
              >
                <Icon path={mdiCogOutline} size={1} />
              </Button>
              <Button
                buttonType="secondary"
                buttonSize="normal"
                className="flex h-13 items-center"
                onClick={toggleAddFilesModal}
                disabled={isRelocatePending}
              >
                Add Files
              </Button>
              <Button
                buttonType="primary"
                buttonSize="normal"
                className="flex h-13 flex-wrap items-center gap-x-2"
                onClick={handleRename}
                loading={isRelocatePending}
                disabled={renameDisabled}
                tooltip={renameDisabledReason}
              >
                <Icon path={mdiFileDocumentEditOutline} size={1} />
                Rename Files
              </Button>
            </div>
            <AddFilesModal show={showAddFilesModal} onClose={toggleAddFilesModal} />
          </div>
        </ShokoPanel>

        <AnimateHeight height={showSettings ? 'auto' : 0}>
          <div className={cx('my-3 flex h-128! gap-x-6', isRelocatePending && 'pointer-events-none opacity-65')}>
            {relocationPresetsQuery.isSuccess && (
              <>
                <div className="flex w-1/3 flex-col gap-y-6">
                  <ShokoPanel
                    title="Preset Selection"
                    contentClassName="gap-y-5"
                    className="h-128"
                  >
                    <Select
                      label="Preset"
                      id="relocation-preset"
                      value={selectedPreset?.ID ?? 'na'}
                      onChange={event => changeSelectedPreset(event.target.value)}
                      options={
                        <div className="flex items-center gap-x-2">
                          <Button
                            onClick={handleSetAsDefault}
                            loading={isUpdatePresetPending}
                            disabled={selectedPreset?.IsDefault || isUpdatePresetPending}
                            tooltip={selectedPreset?.IsDefault ? 'Already set as default!' : 'Set as default'}
                          >
                            <Icon className="text-panel-text-primary" path={mdiStarCircleOutline} size={1} />
                          </Button>

                          <Button
                            onClick={handleDeletePreset}
                            loading={isDeletePresetPending}
                            disabled={selectedPreset?.IsDefault || isDeletePresetPending}
                            tooltip={selectedPreset?.IsDefault ? 'Cannot delete default preset!' : 'Delete Preset'}
                          >
                            <Icon className="text-panel-text-danger" path={mdiTrashCanOutline} size={1} />
                          </Button>

                          <Button onClick={() => openPresetModal(true)} tooltip="Rename Preset">
                            <Icon className="text-panel-text-primary" path={mdiPencilOutline} size={1} />
                          </Button>

                          <Button onClick={() => openPresetModal(false)} tooltip="New Preset">
                            <Icon className="text-panel-text-primary" path={mdiPlusCircleOutline} size={1} />
                          </Button>
                        </div>
                      }
                    >
                      {relocationPresetsQuery.data.map(preset => <PresetOption preset={preset} key={preset.ID} />)}

                      {relocationPresetsQuery.data.length === 0 && (
                        <option key="na" value="na">
                          No renamer found!
                        </option>
                      )}
                    </Select>

                    {renamer?.Configuration?.ID && newConfig && (
                      <>
                        <div className="flex grow overflow-y-auto pr-2">
                          <DynamicForm
                            configuration={newConfig}
                            configurationId={renamer.Configuration.ID}
                            setConfiguration={setNewConfig}
                            hideCodeBlocks
                            hideHeader
                          />
                        </div>

                        <Button
                          onClick={handleSaveConfig}
                          buttonType="primary"
                          buttonSize="normal"
                          loading={isSaveConfigPending}
                          disabled={isSaveConfigPending || !renamerHasConfig || !configEdited}
                          tooltip={!renamerHasConfig ? 'Renamer does not have any settings to save.' : ''}
                        >
                          Save
                        </Button>
                      </>
                    )}

                    <PresetModal
                      show={showPresetModal}
                      onClose={togglePresetModal}
                      rename={presetRename}
                      preset={selectedPreset}
                    />
                  </ShokoPanel>
                </div>

                <ShokoPanel title="Script" className="w-2/3" disableOverflow>
                  {newConfig && renamer?.Configuration?.ID && (
                    <RenamerScript
                      newConfig={newConfig}
                      setNewConfig={setNewConfig}
                      configurationId={renamer.Configuration.ID}
                    />
                  )}
                </ShokoPanel>
              </>
            )}
          </div>
        </AnimateHeight>

        <ShokoPanel title="Renamer Preview" className="min-h-120 grow">
          {addedFiles.length === 0 && (
            <div className="flex grow items-center justify-center font-semibold">No files selected!</div>
          )}

          {addedFiles.length > 0 && (
            <UtilitiesTable
              columns={columns}
              count={addedFiles.length}
              handleRowSelect={handleRowSelect}
              rows={addedFiles}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              fetchNextPreviewPage={fetchPreviewPage}
              isFetchingNextPage={previewPending}
              isRenamer
            />
          )}
        </ShokoPanel>
      </div>
    </>
  );
};

export default Renamer;
