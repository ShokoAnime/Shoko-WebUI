// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
import SettingsDropdown from '../../components/Buttons/SettingsDropdown';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsUpdateFrequencyType, SettingsMalType, SettingBoolean } from '../../core/reducers/settings/Server';

const updateFrequencyType = [
  ['1', 'Never'],
  ['2', 'Every 6 Hours'],
  ['3', 'Every 12 Hours'],
  ['4', 'Every 24 Hours'],
  ['5', 'Once a Week'],
  ['6', 'Once a Month'],
];

type Props = {
  fields: SettingsMalType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    MAL_AutoLink?: SettingBoolean,
    MAL_NeverDecreaseWatchedNums?: SettingBoolean,
    MAL_Password?: string,
    MAL_Username?: string,
    MAL_UpdateFrequency?: SettingsUpdateFrequencyType,
  }
}

class MalSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      MAL_AutoLink: PropTypes.string,
      MAL_NeverDecreaseWatchedNums: PropTypes.string,
      MAL_Password: PropTypes.string,
      MAL_Username: PropTypes.string,
      MAL_UpdateFrequency: PropTypes.string,
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
          title="MAL Preferences"
          description="MAL preferences"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <FormGroup controlId="MAL_Username">
              <Col sm={3}>
                <ControlLabel>Username</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="text"
                  value={fields.MAL_Username}
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="MAL_Password">
              <Col sm={3}>
                <ControlLabel>Password</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="password"
                  value={fields.MAL_Password}
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <SettingsYesNoToggle
              name="MAL_AutoLink"
              label="Autolink MAL Series"
              value={fields.MAL_AutoLink}
              onChange={this.handleChange}
            />
            <SettingsYesNoToggle
              name="MAL_NeverDecreaseWatchedNums"
              label="Never decrease watched"
              value={fields.MAL_NeverDecreaseWatchedNums}
              onChange={this.handleChange}
            />
            <SettingsDropdown
              name="MAL_UpdateFrequency"
              label="Automatically Update Data"
              values={updateFrequencyType}
              value={fields.MAL_UpdateFrequency}
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
    MAL_AutoLink: server.MAL_AutoLink,
    MAL_NeverDecreaseWatchedNums: server.MAL_NeverDecreaseWatchedNums,
    MAL_Password: server.MAL_Password,
    MAL_UpdateFrequency: server.MAL_UpdateFrequency,
    MAL_Username: server.MAL_Username,
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

export default connect(mapStateToProps, mapDispatchToProps)(MalSettings);
