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
    AniDB_Username: string,
    AniDB_Password: string,
    AniDB_AVDumpKey: string,
    AniDB_ClientPort: string,
    AniDB_AVDumpClientPort: string,
  },
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    AniDB_Username?: string,
    AniDB_Password?: string,
    AniDB_AVDumpKey?: string,
    AniDB_ClientPort?: string,
    AniDB_AVDumpClientPort?: string,
  }
}

class AnidbLoginSettings extends React.Component<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      AniDB_Username: PropTypes.string,
      AniDB_Password: PropTypes.string,
      AniDB_AVDumpKey: PropTypes.string,
      AniDB_ClientPort: PropTypes.string,
      AniDB_AVDumpClientPort: PropTypes.string,
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
    const { fields } = this.state;
    const { saveSettings } = this.props;
    saveSettings(fields);
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
        {this.renderField('Username', 'AniDB_Username', formFields)}
        {this.renderField('Password', 'AniDB_Password', formFields, 'password')}
        {this.renderField('Port', 'AniDB_ClientPort', formFields)}
        {this.renderField('AvDump Key', 'AniDB_AVDumpKey', formFields)}
        {this.renderField('AvDump Port', 'AniDB_AVDumpClientPort', formFields)}
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server,
  server => ({
    AniDB_Password: server.AniDB_Password,
    AniDB_Username: server.AniDB_Username,
    AniDB_AVDumpKey: server.AniDB_AVDumpKey,
    AniDB_ClientPort: server.AniDB_ClientPort,
    AniDB_AVDumpClientPort: server.AniDB_AVDumpClientPort,
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
