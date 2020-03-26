// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, FormGroup } from '@blueprintjs/core';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import SettingsDropdown from '../../components/Buttons/SettingsDropdown';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsTraktType } from '../../core/reducers/settings/Trakt';

const updateFrequencyType = [
  ['1', 'Never'],
  ['2', 'Every 6 Hours'],
  ['3', 'Every 12 Hours'],
  ['4', 'Every 24 Hours'],
  ['5', 'Once a Week'],
  ['6', 'Once a Month'],
];

type Props = {
  fields: SettingsTraktType,
  getTraktCode: () => void,
  saveSettings: ({}) => void,
  fetching: boolean,
  trakt: {
    usercode: string,
    url: string,
  }
}

type ComponentState = {
  fields: {
    Enabled?: boolean,
    TokenExpirationDate?: string,
    UpdateFrequency?: string,
  }
}

class TraktSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    trakt: PropTypes.shape({
      usercode: PropTypes.string,
      url: PropTypes.string,
    }),
    fields: PropTypes.shape({
      Enabled: PropTypes.bool,
      TokenExpirationDate: PropTypes.string,
      UpdateFrequency: PropTypes.string,
    }),
    fetching: PropTypes.bool,
    getTraktCode: PropTypes.func.isRequired,
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
    saveSettings({ context: 'TraktTv', original: fields, changed: formFields });
  };

  renderTraktCode() {
    const { trakt } = this.props;
    const { usercode, url } = trakt;
    const { fetching, getTraktCode } = this.props;
    if (usercode === '') {
      return (
        <FormGroup inline label="Trakt code">
          <Button
            text={fetching ? 'Requesting...' : 'Get Trakt Code'}
            onClick={getTraktCode}
            loading={fetching}
          />
        </FormGroup>
      );
    }
    return [
      <span sm={6} className="text-large vcenter">{usercode}</span>,
      <span sm={6} className="text-right text-medium vcenter"><a href={url} rel="noopener noreferrer" target="_blank">{url}</a></span>,
      <span>You have approximately 10 minutes to visit the URL provided and enter the code,
        server is polling for access token, it will be acquired automatically.
      </span>,
    ];
  }

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="Trakt Token"
        onAction={this.saveSettings}
      >
        <SettingsYesNoToggle
          name="Enabled"
          label="Trakt Enabled"
          value={formFields.Enabled}
          onChange={this.handleChange}
        />
        {formFields.TokenExpirationDate === '' ? this.renderTraktCode()
          : (
            <div>
              <span>Token valid until:</span>
              <span className="text-right">{moment(formFields.TokenExpirationDate, 'X').format('YYYY-MM-DD HH:mm Z')}</span>
            </div>
          )}
        <SettingsDropdown
          name="UpdateFrequency"
          label="Automatically Update Data"
          values={updateFrequencyType}
          value={formFields.UpdateFrequency}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.trakt,
  state => state.settings.server.TraktTv,
  state => state.fetching.trakt_code === true,
  (trakt, server, fetching) => ({
    trakt,
    fields: {
      Enabled: server.Enabled,
      TokenExpirationDate: server.TokenExpirationDate,
      SyncFrequency: server.SyncFrequency,
      UpdateFrequency: server.UpdateFrequency,
    },
    fetching,
  }),
);

function mapStateToProps(state: State): ComponentState {
  return selectComputedData(state);
}

function mapDispatchToProps(dispatch) {
  return {
    getTraktCode: () => { dispatch({ type: Events.SETTINGS_GET_TRAKT_CODE }); },
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_SAVE_SERVER, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraktSettings);
