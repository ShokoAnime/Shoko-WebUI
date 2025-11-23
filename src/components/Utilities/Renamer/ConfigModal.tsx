import React, { useMemo, useState } from 'react';
import { mdiCrownCircleOutline, mdiDeleteCircleOutline, mdiPencilCircleOutline, mdiPlusCircleMultipleOutline, mdiPlusCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";
import cx from 'classnames';

import { axios } from '@/core/axios';
import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useCreateRelocationPipeMutation, useDeleteRelocationPipeMutation, useSaveRelocationPipeMutation } from '@/core/react-query/renamer/mutations';
import { useRelocationPipesQuery, useRelocationProvidersQuery } from '@/core/react-query/renamer/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { RelocationPipeType } from '@/core/types/api/renamer';

type Props = {
  pipe: RelocationPipeType | null;
  onClose: () => void;
  show: boolean;
  changeSelectedPipe: (pipeId: string | undefined) => void;
};

const ConfigModal = (props: Props) => {
  const { changeSelectedPipe, onClose, pipe: inUsePipe, show } = props;
  const providers = useRelocationProvidersQuery(show).data;
  const pipes = useRelocationPipesQuery(show).data;
  const { mutateAsync: deleteConfig } = useDeleteRelocationPipeMutation();
  const { mutateAsync: createConfig } = useCreateRelocationPipeMutation();
  const { mutateAsync: updatePipe } = useSaveRelocationPipeMutation();
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedPipeId, setSelectedPipeId] = useState<string | null>(null);
  const selectedPipe = useMemo(() => pipes?.find(pipe => pipe.ID === selectedPipeId) ?? null, [
    pipes,
    selectedPipeId,
  ]);

  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [pipeName, setPipeName] = useState('');

  const defaultPipeId = useMemo(() => pipes?.find(pipe => pipe.IsDefault)?.ID ?? '', [pipes]);
  const lockedControls = !mode || (mode === 'edit' && !selectedPipe);
  const lockedPipe = mode != null;
  const canCreate = mode === 'create' && pipeName && pipeName.length > 0;
  const changed = mode === 'edit' && selectedPipe && (selectedPipe.Name !== pipeName);

  let subHeader = 'Select Config';
  if (mode === 'edit') subHeader = 'Rename';
  if (mode === 'create') subHeader = 'Create New';

  const handlePipeNameChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (lockedControls) return;
    setPipeName(event.target.value);
  });

  const handlePipeClick = useEventCallback((event: React.MouseEvent<HTMLElement>) => {
    if (lockedPipe) return;

    const selectedPipeId1 = event.currentTarget.dataset.pipeId;
    if (!selectedPipeId1) return;
    const selectedPipe1 = pipes?.find(pipe => pipe.ID === selectedPipeId1) ?? null;
    if (selectedPipe1 && selectedPipe && selectedPipe1.ID === selectedPipe.ID) {
      setSelectedPipeId(null);
      setSelectedProviderId('');
      setPipeName('');
    } else {
      setSelectedPipeId(selectedPipe1?.ID ?? null);
      setSelectedProviderId(selectedPipe1?.ProviderID ?? '');
      setPipeName(selectedPipe1?.Name ?? '');
    }
  });

  const handleClose = useEventCallback(() => {
    setMode(null);
    setSelectedPipeId(null);
    setSelectedProviderId('');
    setPipeName('');
    onClose();
  });

  const handleCancel = useEventCallback(() => {
    if (mode === 'create') {
      setMode(null);
      setSelectedPipeId(null);
      setSelectedProviderId('');
      setPipeName('');
    } else if (mode === 'edit') {
      setMode(null);
      setSelectedProviderId(selectedPipe?.ProviderID ?? '');
      setPipeName(selectedPipe?.Name ?? '');
    } else if (mode === 'remove') {
      setMode(null);
      setSelectedProviderId(selectedPipe?.ProviderID ?? '');
      setPipeName(selectedPipe?.Name ?? '');
    } else if (selectedPipe) {
      setSelectedPipeId(null);
      setSelectedProviderId('');
      setPipeName('');
    } else {
      onClose();
    }
  });

  const handleCopy = useEventCallback(async () => {
    if (!selectedPipe) return;
    const config = await axios.get<unknown, unknown>(`Relocation/Pipe/${selectedPipe.ID}/Configuration`)
      .catch(() => null);
    createConfig({ providerId: selectedPipe.ProviderID, name: selectedPipe.Name, configuration: config }, {
      onSuccess: (pipe) => {
        setMode(null);
        setSelectedPipeId(pipe.ID);
        setSelectedProviderId(pipe.ProviderID);
        setPipeName(pipe.Name);
      },
    });
  });

  const handleDelete = useEventCallback(() => {
    if (!selectedPipe || selectedPipe.IsDefault) return;
    if (inUsePipe?.ID === selectedPipe.ID) {
      changeSelectedPipe(defaultPipeId);
    }
    deleteConfig(selectedPipe.ID, {
      onSuccess: () => {
        setMode(null);
        setSelectedPipeId(null);
        setSelectedProviderId('');
        setPipeName('');
      },
    });
  });

  const handleSave = useEventCallback(() => {
    if (!selectedPipe) return;
    updatePipe({ pipeId: selectedPipe.ID, name: pipeName }, {
      onSuccess: (pipe) => {
        setMode(null);
        setSelectedProviderId(pipe.ProviderID);
        setPipeName(pipe.Name);
      },
    });
  });

  const handleCreate = useEventCallback(() => {
    createConfig({ providerId: selectedProviderId, name: pipeName }, {
      onSuccess: (pipe) => {
        setMode(null);
        setSelectedPipeId(pipe.ID);
        setSelectedProviderId(pipe.ProviderID);
        setPipeName(pipe.Name);
      },
    });
  });

  const handleSetDefault = useEventCallback(() => {
    if (!selectedPipe) return;
    updatePipe({ pipeId: selectedPipe.ID, isDefault: true });
  });

  const handleEditModeToggle = useEventCallback(() => {
    setMode('edit');
    setSelectedProviderId(selectedPipe?.ProviderID ?? '');
    setPipeName(selectedPipe?.Name ?? '');
  });

  const handleCreateModeToggle = useEventCallback(() => {
    const provider = defaultPipeId
      ? pipes!.find(provider => provider.ID === defaultPipeId)!.ProviderID
      : providers?.[0]?.ID ?? '';
    setMode('create');
    setSelectedPipeId(null);
    setSelectedProviderId(provider);
    setPipeName('');
  });

  const buttons = useMemo(() => {
    if (mode === 'create') {
      return (
        <>
          <Button key="add-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button
            key="add-confirm"
            onClick={handleCreate}
            buttonType="primary"
            disabled={!canCreate}
            className="px-6 py-2"
          >
            Create
          </Button>
        </>
      );
    }
    if (mode === 'edit') {
      return (
        <>
          <Button key="edit-cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
          <Button key="edit-save" onClick={handleSave} buttonType="primary" disabled={!changed} className="px-6 py-2">
            Save
          </Button>
        </>
      );
    }
    if (selectedPipe) {
      return (
        <Button key="cancel" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Cancel</Button>
      );
    }
    return (
      <Button key="close" onClick={handleCancel} buttonType="secondary" className="px-6 py-2">Close</Button>
    );
  }, [
    defaultPipeId,
    canCreate,
    changed,
    handleSetDefault,
    handleCancel,
    handleCreate,
    handleDelete,
    handleSave,
    mode,
    selectedPipe,
  ]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      header="Manage Renamer Configurations"
      size="sm"
      overlayClassName="!z-[90]"
      subHeader={subHeader}
    >
      <div className="flex grow flex-col gap-y-2">
        <div className="flex justify-between">
          <div className="mb-2 font-semibold">
            Configurations
          </div>
          <div className="flex gap-x-2">
            <Button onClick={handleDelete} disabled={!!mode || !selectedPipe || selectedPipe.ID === defaultPipeId} tooltip={!mode && selectedPipe && !selectedPipe.IsDefault ? 'Delete Config' : ''}>
              <Icon className="text-panel-icon-danger" path={mdiDeleteCircleOutline} size={1} />
            </Button>
            <Button onClick={handleSetDefault} disabled={!!mode || !selectedPipe || selectedPipe.ID === defaultPipeId} tooltip={!mode && selectedPipe && !selectedPipe.IsDefault ? 'Set As Default Config' : ''}>
              <Icon className="text-panel-icon-action" path={mdiCrownCircleOutline} size={1} />
            </Button>
            <Button onClick={handleEditModeToggle} disabled={!!mode || !selectedPipe} tooltip={!mode && selectedPipe ? 'Rename Config' : ''}>
              <Icon className="text-panel-icon-action" path={mdiPencilCircleOutline} size={1} />
            </Button>
            <Button onClick={handleCopy} disabled={!!mode || !selectedPipe} tooltip={!mode && selectedPipe ? 'Copy Config' : ''}>
              <Icon className="text-panel-icon-action" path={mdiPlusCircleMultipleOutline} size={1} />
            </Button>
            <Button onClick={handleCreateModeToggle} disabled={!!mode} tooltip={!mode ? 'Create New Config' : ''}>
              <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
            </Button>
          </div>
        </div>
        <div className="flex h-[10.5rem] flex-col overflow-y-auto rounded-md border border-panel-border bg-panel-background-alt px-4 py-2 contain-strict">
          {pipes?.map(pipe => (
            <div
              key={pipe.ID}
              data-pipe-id={pipe.ID}
              onClick={handlePipeClick}
              className={cx(
                'flex flex-row justify-between',
                lockedPipe && 'opacity-65',
                !lockedPipe && 'cursor-pointer',
                !lockedPipe && defaultPipeId === pipe.ID && (!selectedPipe || selectedPipe.ID !== pipe.ID)
                  && 'text-panel-text-primary',
                selectedPipe?.ID === pipe.ID && 'text-panel-text-important',
              )}
            >
              <span className="text-start flex flex-row items-center gap-1">
                {pipe.Name}
                {pipe.IsDefault && <Icon path={mdiCrownCircleOutline} size={0.75} />}
              </span>
              <span className="text-end">
                {pipe.Provider?.Name ?? '<unknown>'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 font-semibold">
          Renamer
        </div>
        <Select
          id="renamer"
          value={selectedProviderId}
          className={cx(
            mode !== 'create' && 'opacity-65',
          )}
          onChange={event => setSelectedProviderId(event.target.value)}
          disabled={mode !== 'create'}
        >
          {(mode !== 'create' || providers?.length === 0) && (
            <option key="" value="">
            </option>
          )}
          {providers?.map(provider => (
            <option key={provider.ID} value={provider.ID}>
              {`${provider.Name} - ${provider.Version}`}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <div className="mb-2 font-semibold">
          Name
        </div>
        <Input
          id="pipe-name"
          type="text"
          disabled={lockedControls}
          value={pipeName}
          onChange={handlePipeNameChange}
          className={cx(
            lockedControls && 'opacity-65',
          )}
        />
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        {buttons}
      </div>
    </ModalPanel>
  );
};

export default ConfigModal;
