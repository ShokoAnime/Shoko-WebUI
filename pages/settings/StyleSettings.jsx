import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';

class StyleSettings extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    theme: PropTypes.string,
    notifications: PropTypes.bool,
  };

  render() {
    const { theme, notifications, className } = this.props;

    return (
      <div className={className}>
        <FixedPanel
          title="Style Options"
          description="Settings related to Web UI style"
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Use Light Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button bsStyle={theme !== 'light' ? 'danger' : 'default'}>No</Button>
                    <Button bsStyle={theme === 'light' ? 'success' : 'default'}>Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Use Dark Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button bsStyle={theme !== 'dark' ? 'danger' : 'default'}>No</Button>
                    <Button bsStyle={theme === 'dark' ? 'success' : 'default'}>Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Use Custom Theme</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button bsStyle={theme !== 'custom' ? 'danger' : 'default'}>No</Button>
                    <Button bsStyle={theme === 'custom' ? 'success' : 'default'}>Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Turn Off Global Notifications</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button bsStyle={notifications ? 'default' : 'danger'}>No</Button>
                    <Button bsStyle={notifications ? 'success' : 'default'}>Yes</Button>
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
  } = settings;

  return {
    theme,
    notifications,
  };
}

export default connect(mapStateToProps)(StyleSettings);
