import React, { useEffect, useState } from 'react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import {
  useCreateRelocationPresetMutation,
  useUpdateRelocationPresetMutation,
} from '@/core/react-query/relocation/mutations';
import { useRelocationProvidersQuery } from '@/core/react-query/relocation/queries';

import type { RelocationPresetType } from '@/core/types/api/relocation';

type Props = {
  onClose: () => void;
  preset?: RelocationPresetType;
  rename: boolean;
  show: boolean;
};

const PresetModal = (props: Props) => {
  const {
    onClose,
    preset,
    rename,
    show,
  } = props;
  const providers = useRelocationProvidersQuery(show && !rename).data;

  const [presetName, setPresetName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('na');

  useEffect(() => {
    if (!preset) return;

    if (rename) {
      setPresetName(preset.Name);
      setSelectedProvider(preset.ProviderID);
    } else {
      setPresetName('');
      setSelectedProvider(providers?.[0]?.ID ?? 'na');
    }
  }, [preset, rename, providers]);

  const { isPending: isCreatePresetPending, mutate: createPreset } = useCreateRelocationPresetMutation();
  const { isPending: isUpdatePresetPending, mutate: updatePreset } = useUpdateRelocationPresetMutation();

  const handleSave = () => {
    if (rename) {
      if (!preset) return;

      updatePreset({
        presetId: preset.ID,
        Name: presetName,
      }, {
        onSuccess: onClose,
        onError: () => toast.error('Error while renaming preset!'),
      });
      return;
    }

    createPreset({
      Name: presetName,
      ProviderID: selectedProvider,
    }, {
      onSuccess: (newPreset) => {
        toast.success('Preset created successfully!', `Name: "${newPreset.Name}"`);
        onClose();
      },
      onError: () => toast.error('Error while creating preset!'),
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={rename ? 'Rename Preset' : 'Create Preset'}
      size="sm"
    >
      <Select
        label="Provider"
        id="provider"
        value={selectedProvider}
        onChange={event => setSelectedProvider(event.target.value)}
        disabled={rename}
      >
        {providers?.map(provider => (
          <option key={provider.ID} value={provider.ID}>
            {`${provider.Name} - ${provider.Version}`}
          </option>
        ))}

        {providers?.length === 0 && (
          <option key="na" value="na">
            No providers found!
          </option>
        )}

        {rename && (
          <option key={selectedProvider} value={selectedProvider}>
            {selectedProvider}
          </option>
        )}
      </Select>

      <Input
        id="preset-name"
        type="text"
        label="Preset Name"
        value={presetName}
        onChange={event => setPresetName(event.target.value)}
      />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
          loading={isUpdatePresetPending || isCreatePresetPending}
          disabled={!presetName || selectedProvider === 'na'}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default PresetModal;
