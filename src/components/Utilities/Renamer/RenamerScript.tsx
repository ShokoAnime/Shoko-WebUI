import React from 'react';
import { Editor } from '@monaco-editor/react';
import { findKey } from 'lodash';

import useEventCallback from '@/hooks/useEventCallback';

import type { RenamerConfigSettingsType, RenamerSettingsType } from '@/core/react-query/renamer/types';
import type { Updater } from 'use-immer';

type Props = {
  newConfig: Record<string, RenamerConfigSettingsType>;
  setNewConfig: Updater<Record<string, RenamerConfigSettingsType>>;
  settingsModel: Record<string, RenamerSettingsType>;
};

const RenamerScript = ({ newConfig, setNewConfig, settingsModel }: Props) => {
  const settingName = findKey(
    settingsModel,
    setting => setting.SettingType === 'Code',
  );

  const updateScript = useEventCallback((value?: string) => {
    setNewConfig((draftState) => {
      if (!settingName) return;
      draftState[settingName].Value = value ?? '';
    });
  });

  if (!settingName) return null;

  return (
    <Editor
      defaultLanguage={settingsModel[settingName].Language?.toLowerCase() ?? 'plaintext'}
      value={newConfig[settingName].Value as string}
      onChange={updateScript}
      theme="vs-dark"
    />
  );
};

export default RenamerScript;
