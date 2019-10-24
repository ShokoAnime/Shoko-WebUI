// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
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

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];


class AnidbUpdateSettings extends React.Component<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      Calendar_UpdateFrequency: PropTypes.number,
      Anime_UpdateFrequency: PropTypes.number,
      MyList_UpdateFrequency: PropTypes.number,
      MyListStats_UpdateFrequency: PropTypes.number,
      File_UpdateFrequency: PropTypes.number,
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
        title="AniDB Updates"
        description="AniDB scheduled updates"
        actionName="Save"
        onAction={this.saveSettings}
        form
      >
        <SettingsDropdown
          name="Calendar_UpdateFrequency"
          label="Calendar"
          values={updateFrequencyType}
          value={formFields.Calendar_UpdateFrequency}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="Anime_UpdateFrequency"
          label="Anime and Episode Information"
          values={updateFrequencyType}
          value={formFields.Anime_UpdateFrequency}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="MyList_UpdateFrequency"
          label="Sync Mylist"
          values={updateFrequencyType}
          value={formFields.MyList_UpdateFrequency}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="MyListStats_UpdateFrequency"
          label="Get Mylist Stats"
          values={updateFrequencyType}
          value={formFields.MyListStats_UpdateFrequency}
          onChange={this.handleChange}
        />
        <SettingsDropdown
          name="File_UpdateFrequency"
          label="Files With Missing Info"
          values={updateFrequencyType}
          value={formFields.File_UpdateFrequency}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.AniDb,
  server => ({
    Calendar_UpdateFrequency: server.Calendar_UpdateFrequency,
    Anime_UpdateFrequency: server.Anime_UpdateFrequency,
    MyList_UpdateFrequency: server.MyList_UpdateFrequency,
    MyListStats_UpdateFrequency: server.MyListStats_UpdateFrequency,
    File_UpdateFrequency: server.File_UpdateFrequency,
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

export default connect(mapStateToProps, mapDispatchToProps)(AnidbUpdateSettings);
