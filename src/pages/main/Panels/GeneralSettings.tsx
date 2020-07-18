/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { uiVersion } from '../../../core/util';
import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import Select from '../../../components/Input/Select';
import Button from '../../../components/Buttons/Button';

const UI_VERSION = uiVersion();

class GeneralSettings extends React.Component<Props> {
  componentDidMount = () => {
    const { serverVersion } = this.props;
    serverVersion();
  };

  handleStyleInputChange = (event: any) => {
    const { saveStyleSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveStyleSettings({ [id]: value });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'LogRotator', newSettings: { [id]: value } });
  };

  render() {
    const {
      notifications, Enabled, Zip, Delete, Delete_Days, version, updateChannel,
      webuiUpdateAvailable, checkWebUIUpdate, updateWebUI, downloadingUpdates,
    } = this.props;

    return (
      <FixedPanel title="General">
        <span className="font-bold mt-2">Information</span>
        <div className="flex justify-between my-1">
          Shoko Version
          <div className="flex uppercase items-center">
            {version}
            {/* <Button onClick={() => ({})} className="color-accent text-xs ml-2" tooltip="Check for updates">
              <FontAwesomeIcon icon={faRedo} />
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between my-1">
          <div className="flex items-center">
            WebUI Version
            {webuiUpdateAvailable && (
              <Button onClick={() => updateWebUI()} className="flex text-sm ml-2 items-center color-accent" tooltip="Download Latest Version">
                Update Available
                <FontAwesomeIcon
                  icon={downloadingUpdates ? faSpinner : faDownload}
                  spin={downloadingUpdates}
                  className="text-xs ml-1"
                />
              </Button>
            )}
          </div>
          <div className="flex uppercase items-center">
            {UI_VERSION}
            <Button onClick={() => checkWebUIUpdate()} className="color-accent text-xs ml-2" tooltip="Check for updates">
              <FontAwesomeIcon icon={faRedo} />
            </Button>
          </div>
        </div>
        <span className="font-bold mt-4">Style Options</span>
        <div className="flex justify-between my-1">
          Theme
          <span className="color-accent font-bold">Shoko Modern</span>
        </div>
        <Checkbox label="Global Notifications" id="notifications" isChecked={notifications} onChange={this.handleStyleInputChange} className="w-full" />
        <span className="font-bold mt-4">Other Options</span>
        <div className="flex justify-between my-1">
          Update Channel
          <Select id="updateChannel" value={updateChannel} onChange={this.handleInputChange}>
            <option value="stable">Stable</option>
            <option value="unstable">Unstable</option>
          </Select>
        </div>
        <span className="font-bold mt-4">Log Options</span>
        <Checkbox label="Enable Log Rotation" id="Enabled" isChecked={Enabled} onChange={this.handleInputChange} className="w-full mt-2" />
        <Checkbox label="Compress Logs" id="Zip" isChecked={Zip} onChange={this.handleInputChange} className="w-full" />
        <Checkbox label="Delete Older Logs" id="Delete" isChecked={Delete} onChange={this.handleInputChange} className="w-full" />
        {Delete && (
          <div className="flex justify-between my-1">
            Delete Interval
            <Select id="Delete_Days" value={Delete_Days} onChange={this.handleInputChange}>
              <option value="0">Never</option>
              <option value="7">Daily</option>
              <option value="30">Monthly</option>
              <option value="90">Quarterly</option>
            </Select>
          </div>
        )}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.webuiSettings.v3),
  ...(state.localSettings.LogRotator),
  version: state.jmmVersion,
  webuiUpdateAvailable: state.misc.webuiUpdateAvailable,
  downloadingUpdates: state.fetching.downloadUpdates,
});

const mapDispatch = {
  saveStyleSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_WEBUI, payload: value }),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
  checkWebUIUpdate: () => ({ type: Events.WEBUI_CHECK_UPDATES }),
  updateWebUI: () => ({ type: Events.WEBUI_UPDATE }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(GeneralSettings);
