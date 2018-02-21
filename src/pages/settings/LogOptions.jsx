import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import Events from '../../core/events';
import FixedPanel from '../../components/Panels/FixedPanel';
import { updateLog } from '../../core/actions/settings/Log';

class LogOptions extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    logs: PropTypes.shape({
      rotate: PropTypes.bool,
      zip: PropTypes.bool,
      delete: PropTypes.bool,
      days: PropTypes.number,
    }),
    handleChange: PropTypes.func,
    saveSettings: PropTypes.func,
  };

  constructor() {
    super();
    this.saveSettings = this.saveSettings.bind(this);
  }

  saveSettings() {
    const { saveSettings, logs } = this.props;
    saveSettings(logs);
  }

  render() {
    const { logs } = this.props;
    const { rotate, zip, days } = logs;
    const { className, handleChange } = this.props;

    return (
      <div className={className}>
        <FixedPanel
          actionName="Save"
          onAction={this.saveSettings}
          title="Log Options"
          description="Settings related to Shoko Server log"
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Enable Log Rotation</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { handleChange('rotate', false); }}
                      bsStyle={rotate ? 'default' : 'danger'}
                    >No
                    </Button>
                    <Button
                      onClick={() => { handleChange('rotate', true); }}
                      bsStyle={rotate ? 'success' : 'default'}
                    >Yes
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Compress Log</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { handleChange('zip', false); }}
                      bsStyle={zip ? 'default' : 'danger'}
                    >No
                    </Button>
                    <Button
                      onClick={() => { handleChange('zip', true); }}
                      bsStyle={zip ? 'success' : 'default'}
                    >Yes
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { handleChange('delete', false); }}
                      bsStyle={logs.delete ? 'default' : 'danger'}
                    >No
                    </Button>
                    <Button
                      onClick={() => { handleChange('delete', true); }}
                      bsStyle={logs.delete ? 'success' : 'default'}
                    >Yes
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs Interval</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { handleChange('days', 7); }}
                      bsStyle={days === 7 ? 'success' : 'default'}
                    >Weekly
                    </Button>
                    <Button
                      onClick={() => { handleChange('days', 30); }}
                      bsStyle={days === 30 ? 'success' : 'default'}
                    >Monthly
                    </Button>
                    <Button
                      onClick={() => { handleChange('days', 90); }}
                      bsStyle={days === 90 ? 'success' : 'default'}
                    >Quarterly
                    </Button>
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


function mapDispatchToProps(dispatch) {
  return {
    handleChange: (field, value) => { dispatch(updateLog({ [field]: value })); },
    saveSettings: (logs) => { dispatch({ type: Events.SETTINGS_POST_LOG_ROTATE, payload: logs }); },
  };
}

function mapStateToProps(state) {
  const { settings } = state;
  const { logs } = settings;

  return {
    logs,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogOptions);
