import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, Dropdown, MenuItem } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';
import { setSettings } from '../../core/actions/settings/Api';
import { setTheme, setNotifications } from '../../core/actions/settings/UI';
import store from '../../core/store';

class StyleSettings extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    theme: PropTypes.string,
    notifications: PropTypes.bool,
  };

  static saveSettings() {
    const state = store.getState();
    const settings = {
      uiTheme: state.settings.ui.theme,
      uiNotifications: state.settings.ui.notifications,
    };
    setSettings(settings);
  }

  static changeTheme(value) {
    store.dispatch(setTheme(value));
  }

  static changeNotifications(value) {
    store.dispatch(setNotifications(value));
  }

  render() {
    const { theme, notifications, className } = this.props;

    return (
      <div className={className}>
        <FixedPanel
          title="Style Options"
          description="Settings related to Web UI style"
          actionName="Save"
          onAction={StyleSettings.saveSettings}
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { StyleSettings.changeTheme('light'); }}
                      bsStyle={theme === 'light' ? 'success' : 'default'}
                    >Light</Button>
                    <Button
                      onClick={() => { StyleSettings.changeTheme('dark'); }}
                      bsStyle={theme === 'dark' ? 'success' : 'default'}
                    >Dark</Button>
                    <Button
                      onClick={() => { StyleSettings.changeTheme('custom'); }}
                      bsStyle={theme === 'custom' ? 'success' : 'default'}
                    >Custom</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Custom Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Dropdown>
                      <Dropdown.Toggle>
                        Default
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="super-colors">
                        <MenuItem>Default</MenuItem>
                      </Dropdown.Menu>
                    </Dropdown>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Turn Off Global Notifications</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { StyleSettings.changeNotifications(false); }}
                      bsStyle={notifications ? 'default' : 'danger'}
                    >No</Button>
                    <Button
                      onClick={() => { StyleSettings.changeNotifications(true); }}
                      bsStyle={notifications ? 'success' : 'default'}
                    >Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
            </tbody>
          </table>
        </FixedPanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { settings } = state;
  const {
    theme,
    notifications,
  } = settings.ui;

  return {
    theme,
    notifications,
  };
}

export default connect(mapStateToProps)(StyleSettings);
