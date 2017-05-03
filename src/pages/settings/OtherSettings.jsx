import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonGroup, Button, FormControl } from 'react-bootstrap';
import FixedPanel from '../../components/Panels/FixedPanel';
import { setSettings } from '../../core/actions/settings/Api';
import { setUpdateChannel, setLogDelta } from '../../core/actions/settings/Other';
import store from '../../core/store';

class OtherSettings extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    updateChannel: PropTypes.string,
    logDelta: PropTypes.number,
  };

  static saveSettings() {
    setSettings();
  }

  static changeUpdateChannel(value) {
    store.dispatch(setUpdateChannel(value));
  }

  static changeLogDelta(field) {
    const value = field.getValue();
    store.dispatch(setLogDelta(value));
  }

  render() {
    const { updateChannel, logDelta, className } = this.props;

    return (
      <div className={className}>
        <FixedPanel
          title="Other Options"
          description="General settings"
          actionName="Save"
          onAction={OtherSettings.saveSettings}
        >
          <table className="table">
            <tbody>
              <tr>
                <td>Update Channel</td>
                <td>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => { OtherSettings.changeUpdateChannel('unstable'); }}
                      bsStyle={updateChannel === 'unstable' ? 'success' : 'default'}
                    >Unstable</Button>
                    <Button
                      onClick={() => { OtherSettings.changeUpdateChannel('stable'); }}
                      bsStyle={updateChannel === 'stable' ? 'success' : 'default'}
                    >Stable</Button>
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
                      onChange={() => { OtherSettings.changeLogDelta(this); }}
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
  const {
    updateChannel,
    logDelta,
  } = settings.other;

  return {
    updateChannel,
    logDelta,
  };
}

export default connect(mapStateToProps)(OtherSettings);
