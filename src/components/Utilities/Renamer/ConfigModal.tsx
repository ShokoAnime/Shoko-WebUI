import React, { useEffect, useState } from 'react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useRenamerNewConfigMutation, useRenamerPatchConfigMutation } from '@/core/react-query/renamer/mutations';
import { useRenamersQuery } from '@/core/react-query/renamer/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { RenamerConfigType } from '@/core/react-query/renamer/types';

type Props = {
  config: RenamerConfigType;
  onClose(): void;
  rename: boolean;
  show: boolean;
};

const ConfigModal = ({ config, onClose, rename, show }: Props) => {
  const renamers = useRenamersQuery(show && !rename).data;

  const [configName, setConfigName] = useState('');
  const [selectedRenamer, setSelectedRenamer] = useState('na');

  useEffect(() => {
    if (rename) {
      setConfigName(config.Name);
      setSelectedRenamer(config.RenamerID);
    } else {
      setConfigName('');
      setSelectedRenamer(renamers?.[0].RenamerID ?? 'na');
    }
  }, [config.Name, config.RenamerID, rename, renamers]);

  const { isPending: isNewConfigPending, mutate: newConfig } = useRenamerNewConfigMutation();
  const { isPending: isPatchConfigPending, mutate: patchConfig } = useRenamerPatchConfigMutation();

  const handleSave = useEventCallback(() => {
    if (rename) {
      patchConfig(
        {
          configName: config.Name,
          operations: [{ op: 'replace', path: 'Name', value: configName }],
        },
        {
          onSuccess: onClose,
        },
      );
    } else {
      const defaultSettings = renamers?.find(renamer => renamer.RenamerID === selectedRenamer)?.DefaultSettings;

      newConfig(
        {
          Name: configName,
          RenamerID: selectedRenamer,
          Settings: defaultSettings,
        },
        {
          onSuccess: onClose,
        },
      );
    }
  });

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header={rename ? 'Rename Config' : 'New Config'}
      size="sm"
    >
      <Select
        label="Renamer"
        id="renamer"
        value={selectedRenamer}
        onChange={e => setSelectedRenamer(e.target.value)}
        disabled={rename}
      >
        {renamers?.map(renamer => (
          <option key={renamer.Name} value={renamer.Name}>
            {renamer.Name}
          </option>
        ))}

        {renamers?.length === 0 && (
          <option key="na" value="na">
            No renamer found!
          </option>
        )}

        {rename && (
          <option key={config.RenamerID} value={config.RenamerID}>
            {config.RenamerID}
          </option>
        )}
      </Select>

      <Input
        id="config-name"
        type="text"
        label="Config Name"
        value={configName}
        onChange={e => setConfigName(e.target.value)}
      />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
          loading={isPatchConfigPending || isNewConfigPending}
          disabled={!configName || selectedRenamer === 'na'}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default ConfigModal;
