import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, Dropdown, MenuItem } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';
import { setTheme, setNotifications } from '../../core/actions/settings/UI';
import Events from '../../core/events';

class StyleSettings extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    ui: PropTypes.shape({
      theme: PropTypes.string,
      notifications: PropTypes.bool,
    }),
    changeTheme: PropTypes.func.isRequired,
    changeNotifications: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.saveSettings = this.saveSettings.bind(this);
  }

  saveSettings() {
    const { saveSettings, ui } = this.props;
    saveSettings({
      uiTheme: ui.theme,
      uiNotifications: ui.notifications,
    });
  }

  render() {
    const { ui, className, changeTheme, changeNotifications } = this.props;
    const { theme, notifications } = ui;

    return (
      <div className={className}>
        <FixedPanel
          title="Style Options"
          description="Settings related to Web UI style"
          actionName="Save"
          onAction={this.saveSettings}
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { changeTheme('light'); }}
                      bsStyle={theme === 'light' ? 'success' : 'default'}
                    >Light</Button>
                    <Button
                      onClick={() => { changeTheme('dark'); }}
                      bsStyle={theme === 'dark' ? 'success' : 'default'}
                    >Dark</Button>
                    <Button
                      onClick={() => { changeTheme('custom'); }}
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
                      onClick={() => { changeNotifications(false); }}
                      bsStyle={notifications ? 'default' : 'danger'}
                    >No</Button>
                    <Button
                      onClick={() => { changeNotifications(true); }}
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
