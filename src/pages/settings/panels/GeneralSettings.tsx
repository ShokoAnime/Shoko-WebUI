/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiRefresh, mdiLoading, mdiDownload } from '@mdi/js';
import { Icon } from '@mdi/react';

import { uiVersion } from '../../../core/util';
import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import SelectSmall from '../../../components/Input/SelectSmall';
import Button from '../../../components/Input/Button';


const UI_VERSION = uiVersion();

function GeneralSettings() {
  const dispatch = useDispatch();

  const checkingUpdates = useSelector((state: RootState) => state.fetching.checkingUpdates);
  const downloadingUpdates = useSelector((state: RootState) => state.fetching.downloadUpdates);
  const isFetching = useSelector((state: RootState) => state.fetching.settings);
  const logRotatorSettings = useSelector((state: RootState) => state.localSettings.LogRotator);
  const version = useSelector((state: RootState) => state.jmmVersion);
  const webuiSettings = useSelector((state: RootState) => state.webuiSettings.webui_v2);
  const webuiUpdateAvailable = useSelector((state: RootState) => state.misc.webuiUpdateAvailable);

  useEffect(() => {
    dispatch(({ type: Events.SERVER_VERSION }));
  }, []);

  const checkWebUIUpdate = () => dispatch({ type: Events.WEBUI_CHECK_UPDATES });

  const updateWebUI = () => dispatch(({ type: Events.WEBUI_UPDATE }));

  const handleWebUISettingChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    dispatch({ type: Events.SETTINGS_SAVE_WEBUI, payload: { [id]: value } });
  };

  const handleLogRotatorSettingChange = (event: any) => {
    const propId = event.target.id.replace('LogRotation_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    dispatch({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'LogRotator', newSettings: { [propId]: value } } });
  };

  return (
    <FixedPanel title="General" isFetching={isFetching}>

      <div className="font-bold">Information</div>
      <div className="flex justify-between mt-1">
        Shoko Version
        <div className="flex">
          {version}
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex items-center">
          WebUI Version
          {webuiUpdateAvailable && (
            <Button onClick={() => updateWebUI()} className="flex text-xs ml-2 items-end" tooltip="Download Latest Version">
              Update Available
              <Icon className="ml-1 text-highlight-1" path={downloadingUpdates ? mdiLoading : mdiDownload} spin={downloadingUpdates} size={1} />
            </Button>
          )}
        </div>
        <div className="flex items-center overflow-x-hidden">
          {UI_VERSION}
          <Button onClick={() => checkWebUIUpdate()} className="flex text-xs ml-2" tooltip="Check for updates">
            <Icon className="text-highlight-1" path={checkingUpdates ? mdiLoading : mdiRefresh} spin={checkingUpdates} size={1} />
          </Button>
        </div>
      </div>

      <div className="font-bold mt-3">Style Options</div>
      <div className="flex justify-between mt-1">
        Theme
        <span className="text-highlight-1 font-bold">Shoko Modern</span>
      </div>
      <Checkbox justify label="Global Notifications" id="notifications" isChecked={webuiSettings.notifications} onChange={handleWebUISettingChange} className="mt-1" />
      {webuiSettings.notifications && (
        <SelectSmall label="Notifications Position" id="toastPosition" value={webuiSettings.toastPosition} onChange={handleWebUISettingChange} className="mt-1">
          <option value="bottom-right">Bottom</option>
          <option value="top-right">Top</option>
        </SelectSmall>
      )}

      <div className="font-bold mt-3">Other Options</div>
      <SelectSmall label="Update Channel" id="updateChannel" value={webuiSettings.updateChannel} onChange={handleWebUISettingChange} className="mt-1">
        <option value="stable">Stable</option>
        <option value="unstable">Unstable</option>
      </SelectSmall>

      <div className="font-bold mt-3">Log Options</div>
      <Checkbox justify label="Enable Log Rotation" id="LogRotation_Enabled" isChecked={logRotatorSettings.Enabled} onChange={handleLogRotatorSettingChange} className="mt-1" />
      {logRotatorSettings.Enabled && (<Checkbox justify label="Compress Logs" id="Zip" isChecked={logRotatorSettings.Zip} onChange={handleLogRotatorSettingChange} className="mt-1" />)}
      {logRotatorSettings.Enabled && (<Checkbox justify label="Delete Older Logs" id="Delete" isChecked={logRotatorSettings.Delete} onChange={handleLogRotatorSettingChange} className="mt-1" />)}
      {logRotatorSettings.Enabled && logRotatorSettings.Delete && (
        <SelectSmall label="Delete Interval" id="Delete_Days" value={logRotatorSettings.Delete_Days} onChange={handleLogRotatorSettingChange} className="mt-1">
          <option value="0">Never</option>
          <option value="7">Daily</option>
          <option value="30">Monthly</option>
          <option value="90">Quarterly</option>
        </SelectSmall>
      )}

    </FixedPanel>
  );
}

export default GeneralSettings;
