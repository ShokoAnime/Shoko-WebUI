import React from 'react';

import { useSettingsContext } from '../SettingsPage';

import ShokoPanel from '../../../components/Panels/ShokoPanel';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';

function ImportSettings() {
  const {
    fetching, newSettings, updateSetting,
  } = useSettingsContext();


  const {
    MoveOnImport, RenameOnImport,
    RenameThenMove, RunOnStart,
    UseExistingFileWatchedStatus,
    VideoExtensions,
  } = newSettings.Import;

  return (
    <ShokoPanel title="Import Options" isFetching={fetching}>
      <Checkbox justify label="Import on start" id="import-on-start" isChecked={RunOnStart} onChange={event => updateSetting('Import', 'RunOnStart', event.target.checked)} />
      <Checkbox justify label="Rename on import" id="rename-on-import" isChecked={RenameOnImport} onChange={event => updateSetting('Import', 'RenameOnImport', event.target.checked)} className="mt-2" />
      <Checkbox justify label="Move on import" id="move-on-import" isChecked={MoveOnImport} onChange={event => updateSetting('Import', 'MoveOnImport', event.target.checked)} className="mt-2" />
      <Checkbox justify label="Move after rename" id="move-after-rename" isChecked={RenameThenMove} onChange={event => updateSetting('Import', 'RenameThenMove', event.target.checked)} className="mt-2" />
      <Checkbox justify label="Set file as watched if episode is watched" id="set-file-watched" isChecked={UseExistingFileWatchedStatus} onChange={event => updateSetting('Import', 'UseExistingFileWatchedStatus', event.target.checked)} className="mt-2" />
      <div className="flex justify-between mt-2">
        Video Extensions
        <InputSmall id="username" value={VideoExtensions.join(',')} type="text" onChange={event => updateSetting('Import', 'VideoExtensions', event.target.value.split(','))} className="w-64 px-2 py-0.5" />
      </div>
    </ShokoPanel>
  );
}

export default ImportSettings;
