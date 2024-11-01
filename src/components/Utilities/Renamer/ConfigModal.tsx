import React, { useEffect, useMemo, useState } from 'react';
import { find } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useRenamerNewConfigMutation, useRenamerPatchConfigMutation } from '@/core/react-query/renamer/mutations';
import { useRenamerConfigsQuery, useRenamersQuery } from '@/core/react-query/renamer/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { RenamerConfigType } from '@/core/types/api/renamer';

type Props = {
  config: RenamerConfigType;
  onClose: () => void;
  rename: boolean;
  show: boolean;
  changeSelectedConfig: (configName: string) => void;
};

const ConfigModal = (props: Props) => {
  const {
    changeSelectedConfig,
    config,
    onClose,
    rename,
    show,
  } = props;

  const renamers = useRenamersQuery(show && !rename).data;
  const renamerConfigs = useRenamerConfigsQuery(show && !rename).data;

  const [configName, setConfigName] = useState('');
  const [selectedRenamer, setSelectedRenamer] = useState('na');

  useEffect(() => {
    if (config.Name === '') return;

    if (rename) {
      setConfigName(config.Name);
      setSelectedRenamer(config.RenamerID);
    } else {
      setConfigName('');
      setSelectedRenamer(renamers?.[0].RenamerID ?? 'na');
    }
  }, [config.Name, config.RenamerID, rename, renamers]);

  const { isPending: isNewConfigPending, mutateAsync: newConfig } = useRenamerNewConfigMutation();
  const { isPending: isPatchConfigPending, mutateAsync: patchConfig } = useRenamerPatchConfigMutation();

  const handleSaveAsync = async () => {
    changeSelectedConfig('');

    try {
      if (rename) {
        await patchConfig(
          {
            configName: config.Name,
            operations: [{ op: 'replace', path: '/Name', value: configName }],
          },
        );
      } else {
        const defaultSettings = renamers?.find(renamer => renamer.RenamerID === selectedRenamer)?.DefaultSettings;

        await newConfig(
          {
            Name: configName,
            RenamerID: selectedRenamer,
            Settings: defaultSettings,
          },
        );
      }
    } catch (error) {
      changeSelectedConfig(config.Name);
      toast.error(`Error while ${rename ? 'renaming' : 'creating'} config!`);
      return;
    }

    changeSelectedConfig(configName);
    onClose();
  };

  const handleSave = useEventCallback(() => {
    handleSaveAsync().catch(console.error);
  });

  const configExists = useMemo(
    () => !!find(renamerConfigs, item => item.Name === configName),
    [configName, renamerConfigs],
  );

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
        onChange={event => setSelectedRenamer(event.target.value)}
        disabled={rename}
      >
        {renamers?.map(renamer => (
          <option key={renamer.RenamerID} value={renamer.RenamerID}>
            {`${renamer.Name} - ${renamer.Version}`}
          </option>
        ))}

        {renamers?.length === 0 && (
          <option key="na" value="na">
            No renamer found!
          </option>
        )}

        {rename && (
          <option key={selectedRenamer} value={selectedRenamer}>
            {selectedRenamer}
          </option>
        )}
      </Select>

      <Input
        id="config-name"
        type="text"
        label="Config Name"
        value={configName}
        onChange={event => setConfigName(event.target.value)}
      />

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-6 py-2">Cancel</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-6 py-2"
          loading={isPatchConfigPending || isNewConfigPending}
          disabled={!configName || selectedRenamer === 'na' || configExists}
          tooltip={configExists ? 'Another config with the same name already exists!' : ''}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default ConfigModal;
