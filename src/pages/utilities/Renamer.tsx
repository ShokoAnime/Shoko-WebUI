import React, { useEffect, useMemo, useRef, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { useDispatch, useSelector } from 'react-redux';
import {
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiCircleOutline,
  mdiCloseCircleOutline,
  mdiCogOutline,
  mdiFileDocumentEditOutline,
  mdiFileDocumentPlusOutline,
  mdiLoading,
  mdiMinusCircleMultipleOutline,
  mdiMinusCircleOutline,
  mdiPencil,
  mdiRefresh,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { chunk, find, isEqual } from 'lodash';
import { useDebounceValue, useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import toast from '@/components/Toast';
import AddFilesModal from '@/components/Utilities/Renamer/AddFilesModal';
import ConfigModal from '@/components/Utilities/Renamer/ConfigModal';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import UtilitiesTable from '@/components/Utilities/UtilitiesTable';
import { useManagedFoldersQuery } from '@/core/react-query/managed-folder/queries';
import {
  usePreviewFilesMutation,
  useRelocateFilesWithPipeMutation,
  useSaveRelocationPipeConfigurationMutation,
} from '@/core/react-query/renamer/mutations';
import { useRelocationPipeConfigurationJsonSchemaQuery, useRelocationPipesQuery, useRelocationSummaryQuery } from '@/core/react-query/renamer/queries';
import { clearFiles, clearRenameResults, removeFiles } from '@/core/slices/utilities/renamer';
import useEventCallback from '@/hooks/useEventCallback';
import useRowSelection, { fileIdSelector } from '@/hooks/useRowSelection';
import ControlledConfigurationWithSchema from "@/components/Configuration/ControlledConfigurationWithSchema";

import type { UtilityHeaderType } from '@/components/Utilities/constants';
import type { RootState } from '@/core/store';
import type { FileType } from '@/core/types/api/file';
import type { ManagedFolderType } from '@/core/types/api/managed-folder';
import type { RelocationPipeType, RelocationResultType } from '@/core/types/api/renamer';
import type { JSONSchema4WithUiDefinition } from "@/core/react-query/configuration/types";

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

    if (!result.IsSuccess) {
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

const getStatusIcon = (result: RelocationResultType | undefined, noChange = false) => {
  let icon = mdiCircleOutline;
  let className = '';
  let tooltip = '';

  if (result) {
    if (!result.IsSuccess) {
      icon = mdiCloseCircleOutline;
      className = 'text-panel-text-danger';
      tooltip = 'Rename/preview failed!';
    } else if (noChange) {
      icon = mdiCheckCircleOutline;
      className = 'text-panel-text-important';
      tooltip = 'No change!';
    } else if (result.IsSuccess && result.IsPreview) {
      icon = mdiAlertCircleOutline;
      className = 'text-panel-text-warning';
      tooltip = 'Rename pending!';
    } else if (result.IsSuccess) {
      icon = mdiCheckCircleOutline;
      className = 'text-panel-text-important';
      tooltip = 'Rename successful!';
    }
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
  renameResults: Record<number, RelocationResultType | undefined>,
  managedFolders: ManagedFolderType[],
  moveFiles: boolean,
) => ({
  id: 'status',
  name: 'Status',
  className: 'w-16',
  item: (file) => {
    const result = renameResults[file.ID];
    let noChange = false;

    if (result?.IsSuccess) {
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
        { ID: result.ManagedFolderID ?? -1 },
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

const Renamer = () => {
  const dispatch = useDispatch();

  const settingsQuery = useRelocationSummaryQuery();
  const managedFoldersQuery = useManagedFoldersQuery();
  const relocationPipesQuery = useRelocationPipesQuery();

  const { isPending: relocatePending, mutate: relocateFiles } = useRelocateFilesWithPipeMutation();
  const { isPending: previewPending, mutateAsync: previewFiles } = usePreviewFilesMutation();

  const addedFiles = useSelector((state: RootState) => state.utilities.renamer.files);
  const renameResults = useSelector((state: RootState) => state.utilities.renamer.renameResults);

  const [isRenaming, setIsRenaming] = useState(false);
  const [selectedPipe, setSelectedPipe] = useState<RelocationPipeType | null>(null);
  const [{ successCount, errorCount }, setCounts] = useState({ successCount: 0, errorCount: 0 });

  const { config: pipeConfig, info: pipeInfo, schema: pipeSchema } = useRelocationPipeConfigurationJsonSchemaQuery(selectedPipe?.ID).data ?? {};
  const { mutate: savePipeConfig } = useSaveRelocationPipeConfigurationMutation(selectedPipe?.ID!);
  const [config, setConfig] = useState(pipeConfig);
  const refSchema = useRef<JSONSchema4WithUiDefinition | undefined>(pipeSchema);
  const configEdited = useMemo(() => !isEqual(pipeConfig, config), [pipeConfig, config]);

  const [showSettings, toggleSettings] = useToggle(false);
  const [showAddFilesModal, toggleAddFilesModal] = useToggle(false);
  const [showConfigModal, toggleConfigModal] = useToggle(false);
  const [moveFiles, toggleMoveFiles, setMoveFiles] = useToggle(false);
  const [renameFiles, toggleRenameFiles, setRenameFiles] = useToggle(false);

  const {
    handleRowSelect,
    rowSelection,
    selectedRows,
    setRowSelection,
  } = useRowSelection(addedFiles, fileIdSelector);

  const columns = useMemo(() => {
    const managedFolders = managedFoldersQuery?.data ?? [];
    return [
      getFileColumn(managedFolders),
      getResultColumn(renameResults, managedFolders),
      getStatusColumn(renameResults, managedFolders, moveFiles),
    ];
  }, [managedFoldersQuery?.data, moveFiles, renameResults]);

  const [disableProcessing, disableProcessingReason] = useMemo(() => {
    if (!selectedPipe?.IsUsable) return [true, 'Provider is not available'];
    if (isRenaming || relocatePending) return [true, 'Renaming in progress...'];
    if (configEdited) return [true, 'Config has been edited, please save before renaming files'];
    if (addedFiles.length === 0) return [true, 'No files added'];
    if (!moveFiles && !renameFiles) return [true, 'Neither rename nor move is selected. No action to be performed'];
    return [false, ''];
  }, [selectedPipe?.IsUsable, addedFiles.length, isRenaming, configEdited, moveFiles, relocatePending, renameFiles]);

  const fetchPreviewPage = useEventCallback(async (index: number) => {
    if (!config || !selectedPipe) return;
    const pageSize = 20;
    const pageNumber = Math.floor(index / pageSize);
    const pendingPreviews = addedFiles
      .slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize,
      )
      .map(file => file.ID)
      .filter(fileId => !renameResults[fileId]);
    if (pendingPreviews.length === 0 || !selectedPipe) return;
    await previewFiles({
      move: moveFiles,
      rename: renameFiles,
      fileIDs: pendingPreviews,
      providerId: selectedPipe.ProviderID,
      configuration: config,
    });
  });

  const changeSelectedPipe = useEventCallback((pipeId: string | undefined) => {
    if (!pipeId) {
      setSelectedPipe(null);
      return;
    }

    if (!relocationPipesQuery.isSuccess || !relocationPipesQuery.data[0]) return;
    const tempConfig = relocationPipesQuery.data.find(
      config => config.ID === pipeId,
    ) ?? relocationPipesQuery.data[0];
    if (!tempConfig) return;
    setSelectedPipe(tempConfig);
  });

  const processFiles = useEventCallback(async () => {
    if (!selectedPipe) return;
    setIsRenaming(true);
    const filesToProcess = selectedRows.length > 0 ? selectedRows : addedFiles;
    try {
      toast.info(`Processing ${filesToProcess.length} files...`);
      setCounts({ successCount: 0, errorCount: 0 });
      let success = 0;
      let errors = 0;
      // Do them 100 at a time as to not overload the server while also keeping the UI responsive.
      mainLoop: for (const files of chunk(filesToProcess, 100)) {
        const results = await new Promise<RelocationResultType[]>((resolve, reject) => relocateFiles({
          pipeId: selectedPipe.ID,
          move: moveFiles,
          rename: renameFiles,
          deleteEmptyDirectories: true,
          fileIDs: files.map(file => file.ID),
        }, {
          onSuccess: (data) => resolve(data),
          onError: () => reject(),
        }));
        for (const result of results) {
          if (result.IsSuccess) {
            success += 1;
            continue;
          }
          errors += 1;
          toast.error("Failed to relocate file!", result.ErrorMessage);
          if (errors > 10) {
            setCounts({ successCount: success, errorCount: errors });
            toast.info(`Finished processing ${filesToProcess.length} files!`,
              <span>
                <span className="text-panel-text-important">
                  {success}
                </span>
                &nbsp;successful,&nbsp;
                <span className="text-panel-text-danger">
                  {errors}
                </span>
                &nbsp;failed.
              </span>
            );
            break mainLoop;
          }
        }
        setCounts({ successCount: success, errorCount: errors });
      }
      setCounts({ successCount: success, errorCount: errors });
      toast.info('Finished processing!',
        <span>
          <span className="text-panel-text-important">
            {success}
          </span>
          &nbsp;successful,&nbsp;
          <span className="text-panel-text-danger">
            {errors}
          </span>
          &nbsp;failed.
        </span>
      );
    }
    catch (e) {
      toast.error(`Failed to rename files: ${e.message}`);
    }
    finally {
      setIsRenaming(false);
    }
  });

  useEffect(() => {
    if (!relocationPipesQuery.isSuccess) return;
    const pipe = relocationPipesQuery.data.find(pipe => pipe.IsDefault) ?? relocationPipesQuery.data[0];
    if (!pipe) return;
    setSelectedPipe(pipe);
  }, [relocationPipesQuery.isSuccess]);

  useEffect(() => {
    if (!settingsQuery.isSuccess) return;
    const settings = settingsQuery.data;
    setMoveFiles(settingsQuery.data.MoveOnImport);
    // In the case where move on import is not selected, we will assume the user wants to rename files when
    // they open this page. Otherwise, why are they here? In most cases, it would be for renaming.
    setRenameFiles(settings.MoveOnImport ? settings.RenameOnImport : true,);
  }, [settingsQuery.isSuccess]);

  useEffect(() => {
    setConfig(pipeConfig);
    refSchema.current = pipeSchema;
  }, [pipeConfig, pipeSchema]);

  const removeAll = useEventCallback(() => {
    setCounts({ successCount: 0, errorCount: 0 });
    dispatch(clearFiles());
  });

  // Handle the below 3 hooks with care. These are used for auto-updating previews on changes.
  // We combine them here because there is a delay in when the name changes and the config changes
  // Effect should only be triggered once even if both values change
  const [debouncedConfig] = useDebounceValue(
    config && selectedPipe ? `${selectedPipe.ID}-${JSON.stringify(config)}` : undefined,
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

  useEffect(() => {
    dispatch(clearRenameResults());
  }, [dispatch, moveFiles, renameFiles]);

  return (
    <>
      <title>Rename/Move Files | Shoko</title>
      <div className="flex grow flex-col gap-y-3">
        <ShokoPanel title="Rename/Move Files" optionsClassName="gap-x-3 items-center" options={<>
          <div className="text-lg font-semibold">
            {((successCount + errorCount) > 0 || isRenaming) && (
              <>
                <span>
                  <span className="text-panel-text-important">
                    {successCount}
                  </span>
                  &nbsp;Successful
                </span>
                <span>&nbsp;|&nbsp;</span>
                <span>
                  <span className="text-panel-text-danger">
                    {errorCount}
                  </span>
                  &nbsp;Failure
                </span>
                <span>&nbsp;|&nbsp;</span>
              </>
            )}
            <span>
              <span className="text-panel-text-important">
                {addedFiles.length}
                &nbsp;
              </span>
              {addedFiles.length === 1 ? 'File' : 'Files'}
            </span>
            {selectedRows.length > 0 && (
              <>
                <span>&nbsp;|&nbsp;</span>
                <span>
                  <span className="text-panel-text-important">
                    {selectedRows.length}
                    &nbsp;
                  </span>
                  Selected
                </span>
              </>
            )}
          </div>
          <Button
            buttonType="secondary"
            buttonSize="normal"
            tooltip={selectedPipe?.Provider?.Configuration ? 'Modify Renamer Settings' : ''}
            className="flex h-13 items-center"
            onClick={toggleSettings}
            disabled={!relocationPipesQuery.isSuccess || !selectedPipe?.Provider?.Configuration}
          >
            <Icon path={mdiCogOutline} size={1} />
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="normal"
            tooltip="Manage Renamer Configurations"
            className="flex h-13 items-center"
            onClick={toggleConfigModal}
            disabled={!relocationPipesQuery.isSuccess}
          >
            <Icon path={mdiPencil} size={1} />
          </Button>
          <Select
            id="selected-relocation-pipe"
            className="w-[24rem]"
            value={selectedPipe?.ID ?? ''}
            onChange={event => changeSelectedPipe(event.target.value)}
          >
            {relocationPipesQuery.data?.map(pipe => (
              <option key={pipe.ID} value={pipe.ID}>
                {pipe.Provider
                  ? `${pipe.Name} (${pipe.Provider.Name} - ${pipe.Provider.Version})`
                  : `${pipe.Name} (<Unknown>)`}
              </option>
            ))}

            {!relocationPipesQuery.data?.length && (
              <option key="na" value="na">
                No relocation pipes found!
              </option>
            )}
          </Select>
        </>}>
          <div className="flex items-center gap-x-3">
            <div
              className={cx(
                'flex h-13 grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 transition-opacity',
                relocatePending ? 'opacity-65 pointer-events-none' : '',
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
                disabled={!relocatePending && selectedRows.length === 0}
              />
              <MenuButton
                onClick={removeAll}
                icon={mdiMinusCircleMultipleOutline}
                name="Remove All"
                disabled={addedFiles.length === 0}
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
            <div className="flex gap-x-3">
              <Button
                buttonType="secondary"
                buttonSize="normal"
                className="flex h-13 flex-wrap items-center gap-x-2"
                onClick={toggleAddFilesModal}
                disabled={relocatePending}
              >
                <Icon path={mdiFileDocumentPlusOutline} size={1} />
                Add Files
              </Button>
              <Button
                buttonType="primary"
                buttonSize="normal"
                className="flex h-13 flex-wrap items-center gap-x-2"
                onClick={processFiles}
                loading={relocatePending}
                disabled={disableProcessing}
                tooltip={disableProcessingReason}
              >
                <Icon path={mdiFileDocumentEditOutline} size={1} />
                Process Files
              </Button>
            </div>
            <AddFilesModal show={showAddFilesModal} onClose={toggleAddFilesModal} />
          </div>
        </ShokoPanel>

        <AnimateHeight height={showSettings && selectedPipe?.Provider?.Configuration ? 'auto' : 0}>
          <div className={cx('my-3 flex', (relocatePending || isRenaming) && 'opacity-65 pointer-events-none')}>
            {relocationPipesQuery.isSuccess && (
              <>
                <ShokoPanel title="Configuration" className="w-full max-h-[64rem]" contentClassName="flex flex-col gap-y-6  overflow-y-auto p-6">
                  {pipeSchema && pipeInfo && refSchema.current === pipeSchema && pipeConfig && config ? (
                    <ControlledConfigurationWithSchema
                      config={config}
                      configGuid={pipeInfo.ID}
                      hasChanged={configEdited}
                      info={pipeInfo}
                      save={savePipeConfig}
                      schema={pipeSchema}
                      baseConfig
                      setConfig={setConfig}
                    />
                  ) : null}
                </ShokoPanel>
              </>
            )}
          </div>
        </AnimateHeight>

        <ShokoPanel title="Outputs" className="min-h-[40rem] grow">
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
      <ConfigModal
        show={showConfigModal}
        onClose={toggleConfigModal}
        pipe={selectedPipe}
        changeSelectedPipe={changeSelectedPipe}
      />
    </>
  );
};

export default Renamer;
