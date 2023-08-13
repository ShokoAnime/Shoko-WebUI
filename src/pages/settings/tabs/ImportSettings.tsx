import React from 'react';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import { useSettingsContext } from '@/pages/settings/SettingsPage';

function ImportSettings() {
  const { newSettings, updateSetting } = useSettingsContext();

  const {
    MoveOnImport,
    RenameOnImport,
    RenameThenMove,
    RunOnStart,
    UseExistingFileWatchedStatus,
    VideoExtensions,
  } = newSettings.Import;

  return (
    <>
      <div className="text-xl font-semibold">Import</div>
      <div className="mt-0.5 flex flex-col gap-y-4">
        <div className="font-semibold">Import Options</div>
        <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
          <Checkbox
            justify
            label="Import on start"
            id="import-on-start"
            isChecked={RunOnStart}
            onChange={event => updateSetting('Import', 'RunOnStart', event.target.checked)}
          />
          <Checkbox
            justify
            label="Rename on import"
            id="rename-on-import"
            isChecked={RenameOnImport}
            onChange={event => updateSetting('Import', 'RenameOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Move on import"
            id="move-on-import"
            isChecked={MoveOnImport}
            onChange={event => updateSetting('Import', 'MoveOnImport', event.target.checked)}
          />
          <Checkbox
            justify
            label="Move after rename"
            id="move-after-rename"
            isChecked={RenameThenMove}
            onChange={event => updateSetting('Import', 'RenameThenMove', event.target.checked)}
          />
          <Checkbox
            justify
            label="Set file as watched if episode is watched"
            id="set-file-watched"
            isChecked={UseExistingFileWatchedStatus}
            onChange={event => updateSetting('Import', 'UseExistingFileWatchedStatus', event.target.checked)}
          />
          <div className="flex justify-between">
            Video Extensions
            <InputSmall
              id="username"
              value={VideoExtensions.join(',')}
              type="text"
              onChange={event => updateSetting('Import', 'VideoExtensions', event.target.value.split(','))}
              className="w-64 px-3 py-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ImportSettings;
