import React, { Suspense, lazy } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { findKey } from 'lodash';

import type { RenamerConfigSettingsType, RenamerSettingsType } from '@/core/types/api/renamer';
import type { Updater } from 'use-immer';

const RenamerEditor = lazy(
  () => import('@/components/Utilities/Renamer/RenamerEditor'),
);

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

  const updateScript = (value?: string) => {
    setNewConfig((draftState) => {
      if (!settingName) return;
      draftState[settingName].Value = value ?? '';
    });
  };

  if (!settingName) {
    return (
      <div className="flex size-full grow flex-col items-center justify-center gap-y-2 text-center">
        This renamer does not have any script to edit!
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} spin size={3} />
        </div>
      }
    >
      <RenamerEditor
        defaultLanguage={settingsModel[settingName].Language?.toLowerCase() ?? 'plaintext'}
        value={newConfig[settingName].Value as string}
        onChange={updateScript}
      />
    </Suspense>
  );
};

export default RenamerScript;
