// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import SettingsDropdown from '../../components/Buttons/SettingsDropdown';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsAnidbMylistType } from '../../core/reducers/settings/Server';

type Props = {
  fields: SettingsAnidbMylistType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: SettingsAnidbMylistType
}

const mylistDeleteTypes = [
  [0, 'Delete File (AniDB)'],
  [1, 'Delete File (Local)'],
  [2, 'Mark Deleted'],
  [3, 'Mark External (CD/DVD)'],
  [4, 'Mark Unknown'],
  [5, 'DVD/BD'],
];

const mylistStorageTypes = [
  [0, 'Unknown'],
  [1, 'HDD'],
  [2, 'Disk'],
  [3, 'Deleted'],
  [4, 'Remote'],
];

class AnidbMylistSettings extends React.Component<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      MyList_AddFiles: PropTypes.bool,
      MyList_DeleteType: PropTypes.number,
      MyList_ReadUnwatched: PropTypes.bool,
      MyList_ReadWatched: PropTypes.bool,
      MyList_SetUnwatched: PropTypes.bool,
      MyList_SetWatched: PropTypes.bool,
      MyList_StorageState: PropTypes.number,
    }),
    saveSettings: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleChange = (field: string, value: string) => {
    const { fields } = this.state;
    this.setState({ fields: Object.assign({}, fields, { [field]: value }) });
  };

  saveSettings = () => {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const { saveSettings } = this.props;
    const formFields = Object.assign({}, fields, stateFields);
    saveSettings({ context: 'AniDb', original: fields, changed: formFields });
  };

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="AniDB Mylist"
        onAction={this.saveSettings}
      >
        <SettingsYesNoToggle
          name="MyList_AddFiles"
          label="Add Files"
          tooltip="If selected when importing files, the files will be added to your AniDB account"
          value={formFields.MyList_AddFiles}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="MyList_StorageState"
          label="Storage State"
          tooltip="The storage state files will be set to when added to your list"
          values={mylistStorageTypes}
          value={formFields.MyList_StorageState}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="MyList_DeleteType"
          label="Delete Action"
          tooltip={'What action to take for a file when you delete it from you local collection.\n'
          + 'Delete File (AniDB) - Removes file from your AniDB MyList.\n'
          + 'Delete File (Local DB) - Remove file from your local DB only.\n'
          + 'Mark Deleted - Leaves the file on your list, but changes the state to deleted.\n'
          + 'Mark External (CD/DVD) - Leaves the file on your list, but changes the state to external storage.\n'
          + 'Mark Unknown - Leaves the file on your list, but changes the state to unkown.'}
          values={mylistDeleteTypes}
          value={formFields.MyList_DeleteType}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="MyList_ReadWatched"
          label="Read Watched"
          tooltip="If the file is set as watched on AniDB, it will also be set as watched on your local collection"
          value={formFields.MyList_ReadWatched}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="MyList_ReadUnwatched"
          label="Read Unwatched"
          tooltip="If the file is set as un-watched on AniDB, it will also be set as un-watched on your local collection"
          value={formFields.MyList_ReadUnwatched}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="MyList_SetWatched"
          label="Set Watched"
          tooltip="When you finish watching a video, or manually mark a video as watched, AniDB will also be updated"
          value={formFields.MyList_SetWatched}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="MyList_SetUnwatched"
          label="Set Unwatched"
          tooltip="When you manually mark a video as watched, AniDB will also be updated"
          value={formFields.MyList_SetUnwatched}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.AniDb,
  server => ({
    MyList_AddFiles: server.MyList_AddFiles,
    MyList_DeleteType: server.MyList_DeleteType,
    MyList_ReadUnwatched: server.MyList_ReadUnwatched,
    MyList_ReadWatched: server.MyList_ReadWatched,
    MyList_SetUnwatched: server.MyList_SetUnwatched,
    MyList_SetWatched: server.MyList_SetWatched,
    MyList_StorageState: server.MyList_StorageState,
  }),
);

function mapStateToProps(state: State): ComponentState {
  return {
    fields: selectComputedData(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_SAVE_SERVER, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AnidbMylistSettings);
