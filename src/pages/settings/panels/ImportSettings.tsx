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
    saveSettings({ newSettings: { [id]: value }, context: 'Import' });
  };

  render() {
    const {
      RunOnStart, UseExistingFileWatchedStatus, MoveOnImport,
      RenameOnImport, isFetching,
    } = this.props;

    return (
      <FixedPanel title="Import" isFetching={isFetching}>
        <Checkbox label="Import on start" id="RunOnStart" isChecked={RunOnStart} onChange={this.handleInputChange} />
        <Checkbox label="Rename on import" id="RenameOnImport" isChecked={RenameOnImport} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Move on import" id="MoveOnImport" isChecked={MoveOnImport} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Set file as watched if episode is watched" id="UseExistingFileWatchedStatus" isChecked={UseExistingFileWatchedStatus} onChange={this.handleInputChange} className="mt-1" />
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  RunOnStart: state.localSettings.Import.RunOnStart,
  UseExistingFileWatchedStatus: state.localSettings.Import.UseExistingFileWatchedStatus,
  RenameThenMove: state.localSettings.Import.RenameThenMove,
  RenameOnImport: state.localSettings.Import.RenameOnImport,
  MoveOnImport: state.localSettings.Import.MoveOnImport,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(ImportSettings);
