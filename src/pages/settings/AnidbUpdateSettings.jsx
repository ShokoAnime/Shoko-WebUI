// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Col } from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
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
  ['1', 'Never'],
  ['2', 'Every 6 Hours'],
  ['3', 'Every 12 Hours'],
  ['4', 'Every 24 Hours'],
  ['5', 'Once a Week'],
  ['6', 'Once a Month'],
];


class AnidbUpdateSettings extends React.Component<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      AniDB_MyList_AddFiles: PropTypes.string,
      AniDB_MyList_DeleteType: PropTypes.string,
      AniDB_MyList_ReadUnwatched: PropTypes.string,
      AniDB_MyList_ReadWatched: PropTypes.string,
      AniDB_MyList_SetUnwatched: PropTypes.string,
      AniDB_MyList_SetWatched: PropTypes.string,
      AniDB_MyList_StorageState: PropTypes.string,
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
    this.setState({ fields: Object.assign({}, this.state.fields, { [field]: value }) });
  };

  saveSettings = () => {
    this.props.saveSettings(this.state.fields);
  };

  render() {
    const fields = Object.assign({}, this.props.fields, this.state.fields);

    return (
      <Col lg={4}>
        <FixedPanel
          title="AniDB Updates"
          description="AniDB scheduled updates"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <SettingsDropdown
              name="AniDB_Calendar_UpdateFrequency"
              label="Calendar"
              values={updateFrequencyType}
              value={fields.AniDB_Calendar_UpdateFrequency}
              onChange={this.handleChange}
            />
            <SettingsDropdown
              name="AniDB_Anime_UpdateFrequency"
              label="Anime and Episode Information"
              values={updateFrequencyType}
              value={fields.AniDB_Anime_UpdateFrequency}
              onChange={this.handleChange}
            />
            <SettingsDropdown
              name="AniDB_MyList_UpdateFrequency"
              label="Sync Mylist"
              values={updateFrequencyType}
              value={fields.AniDB_MyList_UpdateFrequency}
              onChange={this.handleChange}
            />
            <SettingsDropdown
              name="AniDB_MyListStats_UpdateFrequency"
              label="Get Mylist Stats"
              values={updateFrequencyType}
              value={fields.AniDB_MyListStats_UpdateFrequency}
              onChange={this.handleChange}
            />
            <SettingsDropdown
              name="AniDB_File_UpdateFrequency"
              label="Files With Missing Info"
              values={updateFrequencyType}
              value={fields.AniDB_File_UpdateFrequency}
              onChange={this.handleChange}
            />
          </Form>
        </FixedPanel>
      </Col>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server,
  server => ({
    AniDB_Calendar_UpdateFrequency: server.AniDB_Calendar_UpdateFrequency,
    AniDB_Anime_UpdateFrequency: server.AniDB_Anime_UpdateFrequency,
    AniDB_MyList_UpdateFrequency: server.AniDB_MyList_UpdateFrequency,
    AniDB_MyListStats_UpdateFrequency: server.AniDB_MyListStats_UpdateFrequency,
    AniDB_File_UpdateFrequency: server.AniDB_File_UpdateFrequency,
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
