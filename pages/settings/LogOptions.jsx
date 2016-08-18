import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';

class LogOptions extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isFetching: PropTypes.bool,
    lastUpdated: PropTypes.number,
    logRotation: PropTypes.bool,
    compressLogs: PropTypes.string,
    deleteLogs: PropTypes.bool,
    deleteLogsInterval: PropTypes.string,
  };

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
                    <Button bsStyle={logRotation ? 'default' : 'danger'}>No</Button>
                    <Button bsStyle={logRotation ? 'success' : 'default'}>Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Compress Log Interval</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      bsStyle={compressLogs === 'daily' ? 'success' : 'default'}
                    >Daily</Button>
                    <Button
                      bsStyle={compressLogs === 'weekly' ? 'success' : 'default'}
                    >Weekly</Button>
                    <Button
                      bsStyle={compressLogs === 'monthly' ? 'success' : 'default'}
                    >Montly</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button bsStyle={deleteLogs ? 'default' : 'danger'}>No</Button>
                    <Button bsStyle={deleteLogs ? 'success' : 'default'}>Yes</Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Delete Older Logs Interval</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      bsStyle={deleteLogsInterval === 'daily' ? 'success' : 'default'}
                    >Daily</Button>
                    <Button
                      bsStyle={deleteLogsInterval === 'weekly' ? 'success' : 'default'}
                    >Weekly</Button>
                    <Button
                      bsStyle={deleteLogsInterval === 'monthly' ? 'success' : 'default'}
                    >Montly</Button>
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
    logRotation,
    compressLogs,
    deleteLogs,
    deleteLogsInterval,
  } = settings;

  return {
    logRotation,
    compressLogs,
    deleteLogs,
    deleteLogsInterval,
  };
}

export default connect(mapStateToProps)(LogOptions);
