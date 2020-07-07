/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import Select from '../../../components/Input/Select';

class LogRotatorSettings extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'LogRotator', newSettings: { [id]: value } });
  };

  render() {
    const {
      Enabled, Zip, Delete, Delete_Days,
    } = this.props;

    return (
      <FixedPanel title="Log Rotator">
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
  ...(state.localSettings.LogRotator),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LogRotatorSettings);
