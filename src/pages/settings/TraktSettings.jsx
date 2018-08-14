// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import {
  Form, Col, HelpBlock, FormGroup, ControlLabel, FormControl,
} from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
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
    Trakt_IsEnabled?: 'True' | 'False',
    Trakt_TokenExpirationDate?: string,
    Trakt_UpdateFrequency?: string,
  }
}

class TraktSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    trakt: PropTypes.shape({
      usercode: PropTypes.string,
      url: PropTypes.string,
    }),
    fields: PropTypes.shape({
      Trakt_IsEnabled: PropTypes.oneOf(['True', 'False']),
      Trakt_TokenExpirationDate: PropTypes.string,
      Trakt_UpdateFrequency: PropTypes.string,
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
    const { fields } = this.state;
    const { saveSettings } = this.props;
    saveSettings(fields);
  };

  renderTraktCode() {
    const { trakt } = this.props;
    const { usercode, url } = trakt;
    const { fetching, getTraktCode } = this.props;
    if (usercode === '') {
      return (
        <FormGroup>
          <Col sm={12}>
            <button
              onClick={getTraktCode}
              type="button"
              className="btn btn-info btn-sm pull-right"
            >
              {fetching ? 'Requesting...' : 'Get Trakt Code'}
              <i className={cx('fa fa-refresh', fetching ? 'fa-spin' : 'hidden')} />
            </button>
          </Col>
        </FormGroup>
      );
    }
    return [
      <FormGroup className="flex">
        <Col sm={6} className="text-large vcenter">{usercode}</Col>
        <Col sm={6} className="text-right text-medium vcenter"><a href={url} rel="noopener noreferrer" target="_blank">{url}</a></Col>
      </FormGroup>,
      <FormGroup>
        <Col sm={12}>
          <HelpBlock>You have approximately 10 minutes to visit the URL provided and enter the code,
            server is polling for access token, it will be acquired automatically.
          </HelpBlock>
        </Col>
      </FormGroup>,
    ];
  }

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <Col lg={4}>
        <FixedPanel
          title="Trakt Token"
          description="Trakt authorisation"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <SettingsYesNoToggle
              name="Trakt_IsEnabled"
              label="Trakt Enabled"
              value={formFields.Trakt_IsEnabled}
              onChange={this.handleChange}
            />
            {formFields.Trakt_TokenExpirationDate === '' ? this.renderTraktCode()
              : (
                <FormGroup>
                  <Col sm={6}><ControlLabel>Token valid until:</ControlLabel></Col>
                  <Col sm={6} className="text-right"> <FormControl.Static>{moment(formFields.Trakt_TokenExpirationDate, 'X').format('YYYY-MM-DD HH:mm Z')}</FormControl.Static></Col>
                </FormGroup>
              )}
            <SettingsDropdown
              name="Trakt_UpdateFrequency"
              label="Automatically Update Data"
              values={updateFrequencyType}
              value={formFields.Trakt_UpdateFrequency}
              onChange={this.handleChange}
            />
          </Form>
        </FixedPanel>
      </Col>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.trakt,
  state => state.settings.server,
  state => state.fetching.trakt_code === true,
  (trakt, server, fetching) => ({
    trakt,
    fields: {
      Trakt_IsEnabled: server.Trakt_IsEnabled,
      Trakt_TokenExpirationDate: server.Trakt_TokenExpirationDate,
      Trakt_SyncFrequency: server.Trakt_SyncFrequency,
      Trakt_UpdateFrequency: server.Trakt_UpdateFrequency,
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
