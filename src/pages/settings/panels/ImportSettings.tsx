import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';

function ImportSettings() {
  const dispatch = useDispatch();

  const isFetching = useSelector((state: RootState) => state.fetching.settings);
  const MoveOnImport = useSelector((state: RootState) => state.localSettings.Import.MoveOnImport);
  const RenameOnImport = useSelector(
    (state: RootState) => state.localSettings.Import.RenameOnImport,
  );
  const RenameThenMove = useSelector(
    (state: RootState) => state.localSettings.Import.RenameThenMove,
  );
  const RunOnStart = useSelector((state: RootState) => state.localSettings.Import.RunOnStart);
  const UseExistingFileWatchedStatus = useSelector(
    (state: RootState) => state.localSettings.Import.UseExistingFileWatchedStatus,
  );

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'Import', newSettings } },
  );

  const handleInputChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value !== '') {
      saveSettings({ [id]: value });
    }
  };

  return (
    <FixedPanel title="Import" isFetching={isFetching}>
      <Checkbox justify label="Import on start" id="RunOnStart" isChecked={RunOnStart} onChange={handleInputChange} />
      <Checkbox justify label="Rename on import" id="RenameOnImport" isChecked={RenameOnImport} onChange={handleInputChange} className="mt-1" />
      <Checkbox justify label="Move on import" id="MoveOnImport" isChecked={MoveOnImport} onChange={handleInputChange} className="mt-1" />
      <Checkbox justify label="Move after rename" id="RenameThenMove" isChecked={RenameThenMove} onChange={handleInputChange} className="mt-1" />
      <Checkbox justify label="Set file as watched if episode is watched" id="UseExistingFileWatchedStatus" isChecked={UseExistingFileWatchedStatus} onChange={handleInputChange} className="mt-1" />
    </FixedPanel>
  );
}

export default ImportSettings;
