import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';
import { setLog, getLog } from '../../core/actions/settings/Log';

class LogOptions extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    logRotation: PropTypes.bool,
    compressLogs: PropTypes.bool,
    deleteLogs: PropTypes.bool,
    deleteLogsInterval: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(key, value) {
    const { logRotation, compressLogs, deleteLogs, deleteLogsInterval } = this.props;
    const items = Object.assign({}, {
      rotate: logRotation,
      zip: compressLogs,
      delete: deleteLogs,
      days: deleteLogsInterval,
    }, { [key]: value });
    setLog(items).then(
      () => getLog()
    );
  }

  render() {
    const { isFetching, lastUpdated, logRotation, compressLogs, deleteLogs, deleteLogsInterval,
      className } = this.props;

    return (
      <div className={className}>
        <FixedPanel
          title="Log Options"
          description="Settings related to JMM Server log"
          lastUpdated={lastUpdated}
          isFetching={isFetching}
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Enable Log Rotation</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { this.handleChange('rotate', false); }}
                      bsStyle={logRotation ? 'default' : 'danger'}
                    >No</Button>
                    <Button
                      onClick={() => { this.handleChange('rotate', true); }}
                      bsStyle={logRotation ? 'success' : 'default'}
                    >Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Compress Log</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { this.handleChange('zip', false); }}
                      bsStyle={compressLogs ? 'default' : 'danger'}
                    >No</Button>
                    <Button
                      onClick={() => { this.handleChange('zip', true); }}
                      bsStyle={compressLogs ? 'success' : 'default'}
                    >Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { this.handleChange('delete', false); }}
                      bsStyle={deleteLogs ? 'default' : 'danger'}
                    >No</Button>
                    <Button
                      onClick={() => { this.handleChange('delete', true); }}
                      bsStyle={deleteLogs ? 'success' : 'default'}
                    >Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs Interval</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { this.handleChange('days', 7); }}
                      bsStyle={deleteLogsInterval === 7 ? 'success' : 'default'}
                    >Weekly</Button>
                    <Button
                      onClick={() => { this.handleChange('days', 30); }}
                      bsStyle={deleteLogsInterval === 30 ? 'success' : 'default'}
                    >Monthly</Button>
                    <Button
                      onClick={() => { this.handleChange('days', 90); }}
                      bsStyle={deleteLogsInterval === 90 ? 'success' : 'default'}
                    >Quarterly</Button>
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
  const { items } = settings.logs;

  return {
    logRotation: items.rotate,
    compressLogs: items.zip,
    deleteLogs: items.delete,
    deleteLogsInterval: items.days,
    isFetching: settings.logs.isFetching,
  };
}

export default connect(mapStateToProps)(LogOptions);
