import React from 'react';
import { filter, map } from 'lodash';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';

import type { RenamerConfigSettingsType, RenamerSettingsType } from '@/core/types/api/renamer';
import type { Updater } from 'use-immer';

type Props = {
  newConfig: Record<string, RenamerConfigSettingsType>;
  setNewConfig: Updater<Record<string, RenamerConfigSettingsType>>;
  settingsModel: Record<string, RenamerSettingsType>;
};

type SettingProps = {
  currentValue: string | number | boolean | undefined;
  settingModel: RenamerSettingsType;
  updateSetting: (name: string, value: string | number | boolean) => void;
};

const Setting = React.memo(({ currentValue, settingModel, updateSetting }: SettingProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.type === 'checkbox') {
      updateSetting(settingModel.Name, event.target.checked);
      return;
    }

    const value = ['Integer', 'Decimal'].includes(settingModel.SettingType)
      ? event.target.valueAsNumber
      : event.target.value;
    updateSetting(settingModel.Name, value);
  };

  if (currentValue === undefined) return null;

  switch (settingModel.SettingType) {
    case 'Text':
    case 'LargeText':
      return (
        <div className="flex justify-between">
          {settingModel.Name}
          <InputSmall
            value={currentValue as string}
            onChange={handleChange}
            id={settingModel.Name}
            type="text"
            className="w-64 px-2"
          />
        </div>
      );
    case 'Boolean':
      return (
        <Checkbox
          isChecked={currentValue as boolean}
          onChange={handleChange}
          id={settingModel.Name}
          label={settingModel.Name}
          justify
        />
      );
    case 'Integer':
    case 'Decimal':
      return (
        <div className="flex justify-between">
          {settingModel.Name}
          <InputSmall
            value={currentValue as number}
            onChange={handleChange}
            id={settingModel.Name}
            type="number"
            className="w-16 px-2 text-center"
            min={settingModel.MinimumValue}
            max={settingModel.MaximumValue}
          />
        </div>
      );
    default:
      return null;
  }
});

const RenamerSettings = ({ newConfig, setNewConfig, settingsModel }: Props) => {
  const updateSetting = (name: string, value: string | number | boolean) => {
    setNewConfig((draftState) => {
      draftState[name].Value = value;
    });
  };

  return (
    <div className="flex h-full flex-col gap-y-2 overflow-y-auto contain-strict">
      {map(
        filter(settingsModel, model => model.SettingType !== 'Code'),
        model => (
          <Setting
            key={model.Name}
            currentValue={newConfig[model.Name]?.Value}
            settingModel={model}
            updateSetting={updateSetting}
          />
        ),
      )}
    </div>
  );
};

export default RenamerSettings;
