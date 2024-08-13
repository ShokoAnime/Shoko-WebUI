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

  if (!settingName) {
    return (
      <div className="flex size-full grow flex-col items-center justify-center gap-y-2 text-center">
        This renamer does not have any script to edit!
      </div>
    );
  }

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
