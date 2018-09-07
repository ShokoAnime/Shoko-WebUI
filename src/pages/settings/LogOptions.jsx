// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  ButtonGroup, Button, FormGroup,
} from '@blueprintjs/core';
import Events from '../../core/events';
import { updateLog } from '../../core/actions/settings/Log';
import SettingsPanel from '../../components/Panels/SettingsPanel';

type LogSettingsType = {
  rotate: boolean,
  zip: boolean,
  delete: boolean,
  days: number,
}

type Props = {
  logs: LogSettingsType,
  handleChange: (string, string | boolean | number) => void,
  saveSettings: (LogSettingsType) => void,
}

class LogOptions extends React.Component<Props> {
  static propTypes = {
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

  saveSettings = () => {
    const { saveSettings, logs } = this.props;
    saveSettings(logs);
  };

  renderYesNo = (label, field, value) => {
    const { handleChange } = this.props;
    return (
      <FormGroup key={field} inline label={label}>
        <ButtonGroup>
          <Button
            onClick={() => { handleChange(field, false); }}
            active={value !== true}
          >No
          </Button>
          <Button
            onClick={() => { handleChange(field, true); }}
            active={value === true}
          >Yes
          </Button>
        </ButtonGroup>
      </FormGroup>
    );
  };

  render() {
    const { logs } = this.props;
    const { rotate, zip, days } = logs;
    const { handleChange } = this.props;

    return (
      <SettingsPanel
        title="Log Options"
        onAction={this.saveSettings}
      >
        {this.renderYesNo('Enable Log Rotation', 'rotate', rotate)}
        {this.renderYesNo('Compress Log', 'zip', zip)}
        {this.renderYesNo('Delete Older Logs', 'delete', logs.delete)}
        <FormGroup inline label="Delete Older Logs Interval">
          <ButtonGroup>
            <Button
              onClick={() => { handleChange('days', 0); }}
              active={days === 0}
            >Never
            </Button>
            <Button
              onClick={() => { handleChange('days', 7); }}
              active={days === 7}
            >Weekly
            </Button>
            <Button
              onClick={() => { handleChange('days', 30); }}
              active={days === 30}
            >Monthly
            </Button>
            <Button
              onClick={() => { handleChange('days', 90); }}
              active={days === 90}
            >Quarterly
            </Button>
          </ButtonGroup>
        </FormGroup>
      </SettingsPanel>
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
