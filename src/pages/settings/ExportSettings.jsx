// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Notification } from 'react-bulma-components';
import { Button, FormGroup, Text } from '@blueprintjs/core';
import Events from '../../core/events';
import { settingsJson } from '../../core/actions/settings/Json';
import SettingsPanel from '../../components/Panels/SettingsPanel';


type Props = {
  json: string,
  exportSettings: () => void,
  importSettings: (string) => void,
  updateSettings: (string) => string | boolean
}

class ExportSettings extends React.Component<Props> {
  static propTypes = {
    json: PropTypes.string,
    exportSettings: PropTypes.func,
    importSettings: PropTypes.func,
    updateSettings: PropTypes.func,
  };

  updateSettings = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const { updateSettings } = this.props;
    updateSettings(event.target.value);
  };

  importSettings = () => {
    const { importSettings, json } = this.props;
    importSettings(json);
  };

  render() {
    const { json, exportSettings } = this.props;
    return (
      <SettingsPanel title="Settings Import Export">
        <Notification color="danger">
          <h6>WARNING! Importing invalid configuration WILL break your server.</h6>
        </Notification>
        <Text onChange={this.updateSettings}>{json}</Text>
        <FormGroup>
          <Button onClick={exportSettings}>Export</Button>
          <Button onClick={this.importSettings}>Import</Button>
        </FormGroup>
      </SettingsPanel>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    exportSettings: () => { dispatch({ type: Events.SETTINGS_EXPORT }); },
    importSettings: (value) => { dispatch({ type: Events.SETTINGS_IMPORT, payload: value }); },
    updateSettings: (value) => { dispatch(settingsJson(value)); },
  };
}

function mapStateToProps(state) {
  const { settings } = state;
  const { json } = settings;

  return {
    json,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportSettings);
