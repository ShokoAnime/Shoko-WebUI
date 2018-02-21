import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, FormControl } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';
import Events from '../../core/events';
import { setUpdateChannel, setLogDelta } from '../../core/actions/settings/Other';

class OtherSettings extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    other: PropTypes.shape({
      updateChannel: PropTypes.string,
      logDelta: PropTypes.number,
    }),
    changeUpdateChannel: PropTypes.func.isRequired,
    changeLogDelta: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.saveSettings = this.saveSettings.bind(this);
  }

  saveSettings() {
    const { other, saveSettings } = this.props;
    saveSettings({
      otherUpdateChannel: other.updateChannel,
      logDelta: other.logDelta,
    });
  }

  render() {
    const {
      other, className, changeUpdateChannel, changeLogDelta,
    } = this.props;
    const { updateChannel, logDelta } = other;

    return (
      <div className={className}>
        <FixedPanel
          title="Other Options"
          description="General settings"
          actionName="Save"
          onAction={this.saveSettings}
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Update Channel</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { changeUpdateChannel('unstable'); }}
                      bsStyle={updateChannel === 'unstable' ? 'success' : 'default'}
                    >Unstable
                    </Button>
                    <Button
                      onClick={() => { changeUpdateChannel('stable'); }}
                      bsStyle={updateChannel === 'stable' ? 'success' : 'default'}
                    >Stable
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
              <tr>
                <td>Log Delta</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <FormControl
                      type="text"
                      value={logDelta}
                      onChange={() => { changeLogDelta(this.getValue()); }}
                    />
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
  const { other } = settings;

  return {
    other,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeUpdateChannel: (value) => { dispatch(setUpdateChannel(value)); },
    changeLogDelta: (value) => { dispatch(setLogDelta(value)); },
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_POST_WEBUI, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OtherSettings);
