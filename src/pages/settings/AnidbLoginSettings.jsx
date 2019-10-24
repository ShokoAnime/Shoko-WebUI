// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, InputGroup } from '@blueprintjs/core';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import Events from '../../core/events';

import type { State } from '../../core/store';


type Props = {
  fields: {
    Username: string,
    Password: string,
    AVDumpKey: string,
    ClientPort: string,
    AVDumpClientPort: string,
  },
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    Username?: string,
    Password?: string,
    AVDumpKey?: string,
    ClientPort?: string,
    AVDumpClientPort?: string,
  }
}

class AnidbLoginSettings extends React.Component<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      Username: PropTypes.string,
      Password: PropTypes.string,
      AVDumpKey: PropTypes.string,
      ClientPort: PropTypes.string,
      AVDumpClientPort: PropTypes.string,
    }),
    saveSettings: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const field = e.target;
    const { fields } = this.state;
    const newState = Object.assign({}, fields, { [field.id]: field.value });
    this.setState({ fields: newState });
  };

  saveSettings = () => {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const { saveSettings } = this.props;
    const formFields = Object.assign({}, fields, stateFields);
    saveSettings({ context: 'AniDb', original: fields, changed: formFields });
  };

  renderField = (label, field, formFields, type = 'text') => (
    <FormGroup key={field} inline label={label}>
      <InputGroup
        value={formFields[field]}
        type={type}
        onChange={this.handleChange}
      />
    </FormGroup>
  );

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="AniDB Login"
        onAction={this.saveSettings}
      >
        {this.renderField('Username', 'Username', formFields)}
        {this.renderField('Password', 'Password', formFields, 'password')}
        {this.renderField('Port', 'ClientPort', formFields)}
        {this.renderField('AvDump Key', 'AVDumpKey', formFields)}
        {this.renderField('AvDump Port', 'AVDumpClientPort', formFields)}
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.AniDb,
  server => ({
    Password: server.Password,
    Username: server.Username,
    AVDumpKey: server.AVDumpKey,
    ClientPort: server.ClientPort,
    AVDumpClientPort: server.AVDumpClientPort,
  }),
);

function mapStateToProps(state: State): ComponentState {
  return {
    fields: selectComputedData(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_SAVE_SERVER, payload: value }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AnidbLoginSettings);
