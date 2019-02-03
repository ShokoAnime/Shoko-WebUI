// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  ButtonGroup, Button, FormGroup, InputGroup,
} from '@blueprintjs/core';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import Events from '../../core/events';
import { setUpdateChannel, setLogDelta } from '../../core/actions/settings/Other';

type Props = {
  other: {
    updateChannel: string,
    logDelta: number,
  },
  changeUpdateChannel: (string) => void,
  changeLogDelta: (number) => void,
  saveSettings: ({}) => void,
}

class OtherSettings extends React.Component<Props> {
  static propTypes = {
    other: PropTypes.shape({
      updateChannel: PropTypes.string,
      logDelta: PropTypes.number,
    }),
    changeUpdateChannel: PropTypes.func.isRequired,
    changeLogDelta: PropTypes.func.isRequired,
    saveSettings: PropTypes.func.isRequired,
  };

  saveSettings = () => {
    const { other, saveSettings } = this.props;
    saveSettings({
      otherUpdateChannel: other.updateChannel,
      logDelta: other.logDelta,
    });
  };

  render() {
    const {
      other, changeUpdateChannel, changeLogDelta,
    } = this.props;
    const { updateChannel, logDelta } = other;

    return (
      <SettingsPanel
        title="Other Options"
        onAction={this.saveSettings}
      >
        <FormGroup inline label="Update Channel">
          <ButtonGroup>
            <Button
              onClick={() => { changeUpdateChannel('unstable'); }}
              active={updateChannel === 'unstable'}
            >Unstable
            </Button>
            <Button
              onClick={() => { changeUpdateChannel('stable'); }}
              active={updateChannel === 'stable'}
            >Stable
            </Button>
          </ButtonGroup>
        </FormGroup>
        <FormGroup inline label="Log Delta">
          <InputGroup
            value={logDelta}
            onChange={(event) => { changeLogDelta(event.target.value); }}
          />
        </FormGroup>
      </SettingsPanel>
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
    saveSettings: (value) => {
      dispatch({ type: Events.SETTINGS_POST_WEBUI, payload: value });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OtherSettings);
