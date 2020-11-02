import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';

class ImportSettings extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id, checked: value } = event.target;
    saveSettings({ newSettings: { [id]: value } });
  };

  render() {
    const {
      RunOnStart, UseExistingFileWatchedStatus, isFetching,
    } = this.props;

    return (
      <FixedPanel title="Import" isFetching={isFetching}>
        <Checkbox label="Import on start" id="RunOnStart" isChecked={RunOnStart} onChange={this.handleInputChange} className="w-full mt-0 mb-1" />
        <Checkbox label="Set file as watched if episode is watched" id="UseExistingFileWatchedStatus" isChecked={UseExistingFileWatchedStatus} onChange={this.handleInputChange} className="w-full" />
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  RunOnStart: state.localSettings.Import.RunOnStart,
  UseExistingFileWatchedStatus: state.localSettings.Import.UseExistingFileWatchedStatus,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportSettings);
