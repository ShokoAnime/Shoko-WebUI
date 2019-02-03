// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  ButtonGroup, Button, FormGroup, HTMLSelect,
} from '@blueprintjs/core';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import { setTheme, setNotifications } from '../../core/actions/settings/UI';
import Events from '../../core/events';

type Props = {
  ui: {
    theme: string,
    notifications: boolean,
  },
  changeTheme: (string) => void,
  changeNotifications: (boolean) => void,
  saveSettings: ({}) => void,
}

class StyleSettings extends React.Component<Props> {
  static propTypes = {
    ui: PropTypes.shape({
      theme: PropTypes.string,
      notifications: PropTypes.bool,
    }),
    changeTheme: PropTypes.func.isRequired,
    changeNotifications: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
  };

  saveSettings = () => {
    const { saveSettings, ui } = this.props;
    saveSettings({
      uiTheme: ui.theme,
      uiNotifications: ui.notifications,
    });
  };

  render() {
    const {
      ui, changeTheme, changeNotifications,
    } = this.props;
    const { theme, notifications } = ui;

    return (
      <SettingsPanel
        title="Style Options"
        actionName="Save"
        onAction={this.saveSettings}
      >
        <FormGroup inline label="Theme">
          <ButtonGroup>
            <Button
              onClick={() => { changeTheme('light'); }}
              active={theme === 'light'}
            >Light
            </Button>
            <Button
              onClick={() => { changeTheme('dark'); }}
              active={theme === 'dark'}
            >Dark
            </Button>
            <Button
              onClick={() => { changeTheme('custom'); }}
              active={theme === 'custom'}
            >Custom
            </Button>
          </ButtonGroup>
        </FormGroup>
        <FormGroup inline label="Custom Theme">
          <HTMLSelect>
            <option>Default</option>
          </HTMLSelect>
        </FormGroup>
        <FormGroup inline label="Turn Off Global Notifications">
          <ButtonGroup>
            <Button
              onClick={() => { changeNotifications(false); }}
              active={notifications !== true}
            >No
            </Button>
            <Button
              onClick={() => { changeNotifications(true); }}
              active={notifications === true}
            >Yes
            </Button>
          </ButtonGroup>
        </FormGroup>
      </SettingsPanel>
    );
  }
}

function mapStateToProps(state) {
  const { settings } = state;
  const { ui } = settings;

  return {
    ui,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeTheme: (value) => { dispatch(setTheme(value)); },
    changeNotifications: (value) => { dispatch(setNotifications(value)); },
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_POST_WEBUI, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StyleSettings);
