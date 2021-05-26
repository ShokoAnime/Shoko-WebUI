/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRedo, faDownload, faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';

import { uiVersion } from '../../../core/util';
import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import SelectSmall from '../../../components/Input/SelectSmall';
import Button from '../../../components/Input/Button';

const UI_VERSION = uiVersion();

class GeneralSettings extends React.Component<Props> {
  componentDidMount = () => {
    const { serverVersion } = this.props;
    serverVersion();
  };

  handleWebUIInputChange = (event: any) => {
    const { saveWebUISettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveWebUISettings({ [id]: value });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const propId = id.replace('LogRotation_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'LogRotator', newSettings: { [propId]: value } });
  };

  render() {
    const {
      notifications, Enabled, Zip, Delete, Delete_Days, version, updateChannel,
      webuiUpdateAvailable, checkWebUIUpdate, updateWebUI, downloadingUpdates, toastPosition,
      checkingUpdates, isFetching,
    } = this.props;

    return (
      <FixedPanel title="General" isFetching={isFetching}>

        <div className="font-bold">Information</div>
        <div className="flex justify-between mt-1">
          Shoko Version
          <div className="flex">
            {version}
            { /* eslint-disable-next-line max-len */ }
            {/* <Button onClick={() => ({})} className="color-highlight-1 text-xs ml-2" tooltip="Check for updates">
              <FontAwesomeIcon icon={faRedo} />
            </Button> // NEED API FOR SERVER VERSION CHECK */}
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <div className="flex items-center">
            WebUI Version
            {webuiUpdateAvailable && (
              <Button onClick={() => updateWebUI()} className="flex text-xs ml-2 color-highlight-1 items-end" tooltip="Download Latest Version">
                Update Available
                <FontAwesomeIcon
                  icon={downloadingUpdates ? faCircleNotch : faDownload}
                  spin={downloadingUpdates}
                  className="ml-1"
                />
              </Button>
            )}
          </div>
          <div className="flex items-center overflow-x-hidden">
            {UI_VERSION}
            <Button onClick={() => checkWebUIUpdate()} className="flex color-highlight-1 text-xs ml-2" tooltip="Check for updates">
              <FontAwesomeIcon
                icon={checkingUpdates ? faCircleNotch : faRedo}
                spin={checkingUpdates}
              />
            </Button>
          </div>
        </div>

        <div className="font-bold mt-3">Style Options</div>
        <div className="flex justify-between mt-1">
          Theme
          <span className="color-highlight-1 font-bold">Shoko Modern</span>
        </div>
        <Checkbox label="Global Notifications" id="notifications" isChecked={notifications} onChange={this.handleWebUIInputChange} className="mt-1" />
        {notifications && (
          <SelectSmall label="Notifications Position" id="toastPosition" value={toastPosition} onChange={this.handleWebUIInputChange} className="mt-1">
            <option value="bottom-right">Bottom</option>
            <option value="top-right">Top</option>
          </SelectSmall>
        )}

        <div className="font-bold mt-3">Other Options</div>
        <SelectSmall label="Update Channel" id="updateChannel" value={updateChannel} onChange={this.handleWebUIInputChange} className="mt-1">
          <option value="stable">Stable</option>
          <option value="unstable">Unstable</option>
        </SelectSmall>

        <div className="font-bold mt-3">Log Options</div>
        <Checkbox label="Enable Log Rotation" id="LogRotation_Enabled" isChecked={Enabled} onChange={this.handleInputChange} className="mt-1" />
        {Enabled && (<Checkbox label="Compress Logs" id="Zip" isChecked={Zip} onChange={this.handleInputChange} className="mt-1" />)}
        {Enabled && (<Checkbox label="Delete Older Logs" id="Delete" isChecked={Delete} onChange={this.handleInputChange} className="mt-1" />)}
        {Enabled && Delete && (
          <SelectSmall label="Delete Interval" id="Delete_Days" value={Delete_Days} onChange={this.handleInputChange} className="mt-1">
            <option value="0">Never</option>
            <option value="7">Daily</option>
            <option value="30">Monthly</option>
            <option value="90">Quarterly</option>
          </SelectSmall>
        )}

      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.webuiSettings.webui_v2),
  ...(state.localSettings.LogRotator),
  version: state.jmmVersion,
  webuiUpdateAvailable: state.misc.webuiUpdateAvailable,
  downloadingUpdates: state.fetching.downloadUpdates,
  checkingUpdates: state.fetching.checkingUpdates,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveWebUISettings: (value: any) => ({ type: Events.SETTINGS_SAVE_WEBUI, payload: value }),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
  checkWebUIUpdate: () => ({ type: Events.WEBUI_CHECK_UPDATES }),
  updateWebUI: () => ({ type: Events.WEBUI_UPDATE }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(GeneralSettings);
