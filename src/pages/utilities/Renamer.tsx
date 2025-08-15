import React, { useEffect, useMemo, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { useDispatch, useSelector } from 'react-redux';
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
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { produce } from 'immer';
import { chunk, filter, find, isEqual, map } from 'lodash';
import { useImmer } from 'use-immer';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import AddFilesModal from '@/components/Utilities/Renamer/AddFilesModal';
import ConfigModal from '@/components/Utilities/Renamer/ConfigModal';
import RenamerScript from '@/components/Utilities/Renamer/RenamerScript';
import RenamerSettings from '@/components/Utilities/Renamer/RenamerSettings';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useImportFoldersQuery } from '@/core/react-query/import-folder/queries';
import {
  useRenamerDeleteConfigMutation,
  useRenamerPreviewMutation,
  useRenamerRelocateMutation,
  useRenamerSaveConfigMutation,
} from '@/core/react-query/renamer/mutations';
import { useRenamerByConfigQuery, useRenamerConfigsQuery, useRenamersQuery } from '@/core/react-query/renamer/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { clearFiles, clearRenameResults, removeFiles } from '@/core/slices/utilities/renamer';
import useEventCallback from '@/hooks/useEventCallback';
import useRowSelection from '@/hooks/useRowSelection';

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';
import type { ImportFolderType } from '@/core/types/api/import-folder';
import type { RenamerConfigSettingsType, RenamerConfigType, RenamerResultType } from '@/core/types/api/renamer';

const getFileColumn = (importFolders: ImportFolderType[]) => ({
  id: 'filename',
  name: 'Original Filename',
  className: 'line-clamp-2 grow basis-0 overflow-hidden',
  item: (file) => {
    const path = file.Locations[0]?.RelativePath ?? '';
    const match = /[/\\](?=[^/\\]*$)/g.exec(path);
    const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
    const importFolder = find(
      importFolders,
      { ID: file?.Locations[0]?.ImportFolderID ?? -1 },
    )?.Name ?? '<Unknown>';
    return (
      <div
        className="flex flex-col"
        data-tooltip-id="tooltip"
        data-tooltip-content={path}
        data-tooltip-delay-show={500}
      >
        <span className="line-clamp-1 text-sm font-semibold opacity-65">
          {`${importFolder} - ${relativePath}`}
        </span>
        <span className="line-clamp-1 break-all">
          {path?.split(/[/\\]/g).pop()}
        </span>
      </div>
    );
  },
} as UtilityHeaderType<FileType>);

const getResultColumn = (
  renameResults: Record<number, RenamerResultType>,
  importFolders: ImportFolderType[],
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
    const importFolder = find(
      importFolders,
      { ID: result.ImportFolderID ?? -1 },
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
          {`${importFolder} - ${relativePath}`}
        </span>
        <span className="line-clamp-1 break-all">
          {fileName}
        </span>
      </div>
    );
  },
} as UtilityHeaderType<FileType>);

const getStatusIcon = (result?: RenamerResultType, noChange = false) => {
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
  renameResults: Record<number, RenamerResultType>,
  importFolders: ImportFolderType[],
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
      const importFolder = find(
        importFolders,
        { ID: file?.Locations[0]?.ImportFolderID ?? -1 },
      )?.Name ?? '<Unknown>';

      const newPath = result.RelativePath ?? '';
      const newRelativePath = match ? newPath?.substring(0, match.index) : 'Root Level';
      const newImportFolder = find(
        importFolders,
        { ID: result.ImportFolderID ?? -1 },
      )?.Name ?? '<Unknown>';

      noChange = (path === newPath) && (!moveFiles
        || (importFolder === newImportFolder && relativePath === newRelativePath));
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
        disable ? 'opacity-65 pointer-events-none' : '',
      )}
    >
      <MenuButton
        onClick={() => dispatch(clearRenameResults())}
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

const ConfigOption = React.memo(({ config }: { config: RenamerConfigType }) => {
  const renamersQuery = useRenamersQuery();

  const currentRenamer = useMemo(
    () => find(renamersQuery.data, item => item.RenamerID === config.RenamerID),
    [config.RenamerID, renamersQuery.data],
  );

  let configName: string;
  if (renamersQuery.isPending) {
    configName = 'Loading...';
  } else if (currentRenamer) {
    configName = `${config.Name} (${currentRenamer.Name} - ${currentRenamer.Version})`;
  } else {
    configName = `${config.Name} (<Unknown>)`;
  }

  return (
    <option value={config.Name}>
      {configName}
    </option>
  );
});

const Renamer = () => {
  const dispatch = useDispatch();
  const addedFiles = useSelector((state: RootState) => state.utilities.renamer.files);
  const renameResults = useSelector((state: RootState) => state.utilities.renamer.renameResults);

  const settings = useSettingsQuery().data;
  const importFolderQuery = useImportFoldersQuery();
  const renamerConfigsQuery = useRenamerConfigsQuery();

  const [
    selectedConfig,
    setSelectedConfig,
  ] = useState<RenamerConfigType>({ RenamerID: '', Name: '' });

  const [
    newConfig,
    setNewConfig,
  ] = useImmer<Record<string, RenamerConfigSettingsType> | undefined>(undefined);

  const renamer = useRenamerByConfigQuery(selectedConfig.Name, !!selectedConfig.Name).data;

  const { isPending: relocatePending, mutate: relocateFiles } = useRenamerRelocateMutation();
  const { isPending: previewPending, mutateAsync: previewRename } = useRenamerPreviewMutation();
  const { isPending: savePending, mutate: saveConfig } = useRenamerSaveConfigMutation();
  const { isPending: deletePending, mutate: deleteConfig } = useRenamerDeleteConfigMutation();
  const { isPending: settingsPatchPending, mutate: patchSettings } = usePatchSettingsMutation();

  const [moveFiles, toggleMoveFiles] = useToggle(settings.Plugins.Renamer.MoveOnImport);
  // In the case where move on import is not selected, we will assume the user wants to rename files when
  // they open this page. Otherwise, why are they here? In most cases, it would be for renaming.
  const [renameFiles, toggleRenameFiles] = useToggle(
    settings.Plugins.Renamer.MoveOnImport ? settings.Plugins.Renamer.RenameOnImport : true,
  );
  const [showSettings, toggleSettings] = useToggle(false);
  const [showAddFilesModal, toggleAddFilesModal] = useToggle(false);
  const [showConfigModal, toggleConfigModal] = useToggle(false);
  const [configModelRename, setConfigModelRename] = useState(false);

  const configEdited = useMemo(
    () => !isEqual(selectedConfig.Settings, newConfig),
    [
      newConfig,
      selectedConfig.Settings,
    ],
  );

  const fetchPreviewPage = useEventCallback(async (index: number) => {
    if (!newConfig || !renamer) return;
    const pageSize = 20;
    const pageNumber = Math.floor(index / pageSize);
    const pendingPreviews = addedFiles
      .slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize,
      )
      .map(file => file.ID)
      .filter(fileId => !renameResults[fileId]);

    if (pendingPreviews.length === 0 || !renamer) return;

    await previewRename(
      {
        move: moveFiles,
        rename: renameFiles,
        FileIDs: pendingPreviews,
        Config: {
          RenamerID: renamer.RenamerID,
          Name: 'Preview',
          Settings: map(newConfig, config => config),
        },
      },
    );
  });

  const changeSelectedConfig = useEventCallback((configName: string) => {
    if (configName === '') {
      setSelectedConfig({ RenamerID: '', Name: '' });
      return;
    }

    if (!renamerConfigsQuery.isSuccess || !renamerConfigsQuery.data[0]) return;
    const tempConfig = renamerConfigsQuery.data.find(
      config => config.Name === configName,
    ) ?? renamerConfigsQuery.data[0];

    if (!tempConfig) return;

    setSelectedConfig(tempConfig);
    setNewConfig(tempConfig.Settings);
  });

  // Handle the below 3 hooks with care. These are used for auto-updating previews on changes.
  // We combine them here because there is a delay in when the name changes and the config changes
  // Effect should only be triggered once even if both values change
  const [debouncedConfig] = useDebounceValue(
    newConfig ? `${selectedConfig.Name}-${JSON.stringify(newConfig)}` : undefined,
    500,
  );
  const [initialClear, setInitialClear] = useState(true);
  useEffect(() => {
    if (!debouncedConfig) return;

    // To avoid clearing of rename results on render as it's already cleared from the other useEffect
    if (initialClear) {
      setInitialClear(false);
      return;
    }

    dispatch(clearRenameResults());
    // initialClear is used to skip the effect on initial render, adding it to deps would cause the effect to run
    // an extra time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedConfig, dispatch]);

  const handleSaveConfig = useEventCallback(() => {
    if (!newConfig || !renamer) return;
    saveConfig(
      {
        RenamerID: renamer.RenamerID,
        Name: selectedConfig.Name,
        Settings: map(newConfig, config => config),
      },
      {
        onSuccess: () => {
          toast.success(`"${selectedConfig.Name}" saved successfully!`);
        },
        onError: () => toast.error(`"${selectedConfig.Name}" could not be saved!`),
      },
    );
  });

  const handleDeleteConfig = useEventCallback(() => {
    if (!renamer) return;
    deleteConfig(selectedConfig.Name, {
      onSuccess: () => toast.success(`"${selectedConfig.Name}" deleted successfully!`),
      onError: () => toast.error(`"${selectedConfig.Name}" could not be deleted!`),
    });
    changeSelectedConfig(settings.Plugins.Renamer.DefaultRenamer ?? 'Default');
  });

  const handleSetAsDefault = useEventCallback(() => {
    const newSettings = produce(settings, (draftState) => {
      draftState.Plugins.Renamer.DefaultRenamer = selectedConfig.Name;
    });
    patchSettings({ newSettings }, {
      onSuccess: () => {
        toast.success(`"${selectedConfig.Name}" set as default renamer!`);
      },
      onError: error => toast.error('', error.message),
    });
  });

  const openConfigModal = useEventCallback((rename: boolean) => {
    setConfigModelRename(rename);
    toggleConfigModal();
  });

  useEffect(() => {
    dispatch(clearRenameResults());
  }, [dispatch, moveFiles, renameFiles]);

  useEffect(() => {
    if (!renamerConfigsQuery.isSuccess) return;

    if (selectedConfig.Name) changeSelectedConfig(selectedConfig.Name);
    else changeSelectedConfig(settings.Plugins.Renamer.DefaultRenamer ?? 'Default');
    // This shouldn't run when `selectedConfig.Name` changes.
    // We are resetting `selectedConfig` when new data arrives so that it is up-to-date for `configEdited` flag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeSelectedConfig, renamerConfigsQuery.data, renamerConfigsQuery.isSuccess, settings]);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection<FileType>(addedFiles);

  const columns = useMemo(() => {
    const importFolders = importFolderQuery?.data ?? [];
    return [
      getFileColumn(importFolders),
      getResultColumn(renameResults, importFolders),
      getStatusColumn(renameResults, importFolders, moveFiles),
    ];
  }, [importFolderQuery?.data, moveFiles, renameResults]);

  const renamerSettingsExist = useMemo(
    () =>
      filter(
        renamer?.Settings,
        model => model.SettingType !== 'Code',
      ).length > 0,
    [renamer],
  );

  const handleRename = useEventCallback(() => {
    // Split the files into chunks of 1000 to avoid API errors
    chunk(addedFiles, 1000).forEach((files) => {
      relocateFiles({
        configName: selectedConfig.Name,
        move: moveFiles,
        rename: renameFiles,
        deleteEmptyDirectories: true,
        FileIDs: files.map(file => file.ID),
      });
    });
  });

  const [renameDisabled, renameDisabledReason] = useMemo(() => {
    if (relocatePending) return [true, 'Renaming in progress...'];
    if (configEdited) return [true, 'Config has been edited, please save before renaming files'];
    if (addedFiles.length === 0) return [true, 'No files added'];
    if (!moveFiles && !renameFiles) return [true, 'Neither rename nor move is selected. No action to be performed'];
    return [false, ''];
  }, [addedFiles.length, configEdited, moveFiles, relocatePending, renameFiles]);

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
              disable={relocatePending}
            />
            <div className="flex gap-x-3">
              <Button
                buttonType="secondary"
                buttonSize="normal"
                className="flex h-13 items-center"
                onClick={toggleSettings}
                disabled={!renamerConfigsQuery.isSuccess}
              >
                <Icon path={mdiCogOutline} size={1} />
              </Button>
              <Button
                buttonType="secondary"
                buttonSize="normal"
                className="flex h-13 items-center"
                onClick={toggleAddFilesModal}
                disabled={relocatePending}
              >
                Add Files
              </Button>
              <Button
                buttonType="primary"
                buttonSize="normal"
                className="flex h-13 flex-wrap items-center gap-x-2"
                onClick={handleRename}
                loading={relocatePending}
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
          <div className={cx('my-3 flex !h-[32rem] gap-x-6', relocatePending && 'opacity-65 pointer-events-none')}>
            {renamerConfigsQuery.isSuccess && (
              <>
                <div className="flex w-1/3 flex-col gap-y-6">
                  <ShokoPanel title="Renamer Selection" contentClassName="gap-y-5" fullHeight={!renamerSettingsExist}>
                    <Select
                      label="Config"
                      id="renamer-config"
                      value={selectedConfig.Name}
                      onChange={event => changeSelectedConfig(event.target.value)}
                    >
                      {renamerConfigsQuery.data.map(renamerConfig => (
                        <ConfigOption config={renamerConfig} key={renamerConfig.Name} />
                      ))}

                      {renamerConfigsQuery.data.length === 0 && (
                        <option key="na" value="na">
                          No renamer found!
                        </option>
                      )}
                    </Select>
                    <div className="flex justify-end gap-x-3 font-semibold">
                      <Button
                        onClick={handleSetAsDefault}
                        buttonType="secondary"
                        buttonSize="normal"
                        loading={settingsPatchPending}
                        disabled={(selectedConfig.Name === settings.Plugins.Renamer.DefaultRenamer)
                          || settingsPatchPending}
                        tooltip={selectedConfig.Name === settings.Plugins.Renamer.DefaultRenamer
                          ? 'Already set as default!'
                          : ''}
                      >
                        Set as default
                      </Button>
                      <Button
                        onClick={handleDeleteConfig}
                        buttonType="danger"
                        buttonSize="normal"
                        loading={deletePending}
                        disabled={(selectedConfig.Name === settings.Plugins.Renamer.DefaultRenamer) || deletePending}
                        tooltip={(selectedConfig.Name === settings.Plugins.Renamer.DefaultRenamer)
                          ? 'Cannot delete default config!'
                          : ''}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => openConfigModal(true)}
                        buttonType="secondary"
                        buttonSize="normal"
                      >
                        Rename
                      </Button>
                      <Button
                        onClick={() => openConfigModal(false)}
                        buttonType="secondary"
                        buttonSize="normal"
                      >
                        New
                      </Button>
                      <Button
                        onClick={handleSaveConfig}
                        buttonType="primary"
                        buttonSize="normal"
                        loading={savePending}
                        disabled={savePending || !renamer?.DefaultSettings}
                        tooltip={!renamer?.DefaultSettings ? 'Renamer does not have any settings to save.' : ''}
                      >
                        Save
                      </Button>
                      <ConfigModal
                        show={showConfigModal}
                        onClose={toggleConfigModal}
                        rename={configModelRename}
                        config={selectedConfig}
                        changeSelectedConfig={changeSelectedConfig}
                      />
                    </div>
                  </ShokoPanel>

                  {renamerSettingsExist && (
                    <ShokoPanel title="Selected Renamer Config">
                      {/* TODO: Maybe a todo... The transition div for checkbox is buggy when AnimateHeight is used. */}
                      {/* It doesn't appear before a click event when height is changed. Adding showSetting force re-renders it. */}
                      {newConfig && renamer?.Settings && showSettings && (
                        <RenamerSettings
                          newConfig={newConfig}
                          setNewConfig={setNewConfig}
                          settingsModel={renamer.Settings}
                        />
                      )}
                    </ShokoPanel>
                  )}
                </div>

                <ShokoPanel title="Selected Renamer Script" className="w-2/3" disableOverflow>
                  {newConfig && renamer?.Settings && (
                    <RenamerScript
                      newConfig={newConfig}
                      setNewConfig={setNewConfig}
                      settingsModel={renamer.Settings}
                    />
                  )}
                </ShokoPanel>
              </>
            )}
          </div>
        </AnimateHeight>

        <ShokoPanel title="Renamer Preview" className="min-h-[40rem] grow">
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
              setSelectedRows={setRowSelection}
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
