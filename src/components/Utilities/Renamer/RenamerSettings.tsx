import React from 'react';
import { filter, map } from 'lodash';

import Checkbox from '@/components/Input/Checkbox';

import type { RenamerConfigSettingsType, RenamerSettingsType } from '@/core/react-query/renamer/types';
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

const Setting = ({ currentValue, settingModel, updateSetting }: SettingProps) => {
  if (currentValue === undefined) return null;

  switch (settingModel.SettingType) {
    case 'Text':
      return <div>TEXT</div>;
    case 'LargeText':
      return <div>TEXT AREA</div>;
    case 'Boolean':
      return (
        <Checkbox
          isChecked={currentValue as unknown as boolean}
          onChange={event => updateSetting(settingModel.Name, event.target.checked)}
          id={settingModel.Name}
          label={settingModel.Name}
          justify
        />
      );
    case 'Integer':
    case 'Decimal':
      return <div>INTEGER</div>;
    default:
      return null;
  }
};

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
