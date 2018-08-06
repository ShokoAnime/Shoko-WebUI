// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Col } from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import SettingsInput from '../../components/Buttons/SettingsInput';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsMoviedbType, SettingBoolean } from '../../core/reducers/settings/Server';

type Props = {
  fields: SettingsMoviedbType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    MovieDB_AutoFanart: SettingBoolean,
    MovieDB_AutoFanartAmount: string,
    MovieDB_AutoPosters: SettingBoolean,
    MovieDB_AutoPostersAmount: string,
  }
}

class MoviedbSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      MovieDB_AutoFanart: PropTypes.oneOf(['True', 'False']),
      MovieDB_AutoFanartAmount: PropTypes.string,
      MovieDB_AutoPosters: PropTypes.oneOf(['True', 'False']),
      MovieDB_AutoPostersAmount: PropTypes.string,
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
    const { fields } = this.state;
    const { saveSettings } = this.props;
    saveSettings(fields);
  };

  render() {
    const { fields: stateFields } = this.state;
    const { fields } = this.props;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <Col lg={4}>
        <FixedPanel
          title="MovieDB settings"
          description="MovieDB image download settings"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <SettingsYesNoToggle
              name="MovieDB_AutoFanart"
              label="Fanart"
              value={formFields.MovieDB_AutoFanart}
              onChange={this.handleChange}
            />
            <SettingsInput
              name="MovieDB_AutoFanartAmount"
              label="Max Posters"
              value={formFields.MovieDB_AutoFanartAmount}
              onChange={this.handleChange}
            />
            <SettingsYesNoToggle
              name="MovieDB_AutoPosters"
              label="Posters"
              value={formFields.MovieDB_AutoPosters}
              onChange={this.handleChange}
            />
            <SettingsInput
              name="MovieDB_AutoPostersAmount"
              label="Max Posters"
              value={formFields.MovieDB_AutoPostersAmount}
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
    MovieDB_AutoFanart: server.MovieDB_AutoFanart,
    MovieDB_AutoFanartAmount: server.MovieDB_AutoFanartAmount,
    MovieDB_AutoPosters: server.MovieDB_AutoPosters,
    MovieDB_AutoPostersAmount: server.MovieDB_AutoPostersAmount,
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviedbSettings);
