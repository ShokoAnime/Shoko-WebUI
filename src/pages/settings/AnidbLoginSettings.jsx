// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Form, FormControl, FormGroup, ControlLabel, Col } from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
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
    AniDB_Username: string,
    AniDB_Password: string,
    AniDB_AVDumpKey: string,
    AniDB_ClientPort: string,
    AniDB_AVDumpClientPort: string,
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
      fields: Object.assign({}, props.fields),
    };
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps === this.props) return;
    this.setState({ fields: Object.assign({}, this.props.fields) });
  };

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const field = e.target;
    const newState = Object.assign({}, this.state.fields, { [field.id]: field.value });
    this.setState({ fields: newState });
  };
  saveSettings = () => {
    this.props.saveSettings(this.state.fields);
  };

  render() {
    const fields = Object.assign({}, this.props.fields, this.state.fields);

    return (
      <Col lg={4}>
        <FixedPanel
          title="AniDB Login"
          description="AniDB Login settings"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <FormGroup controlId="AniDB_Username">
              <Col sm={3}>
                <ControlLabel>Username</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="text"
                  value={fields.AniDB_Username}
                  onChange={this.handleChange}
                />
              </Col>
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="AniDB_Password">
              <Col sm={3}>
                <ControlLabel>Password</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="password"
                  value={fields.AniDB_Password}
                  onChange={this.handleChange}
                />
              </Col>
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="AniDB_ClientPort">
              <Col sm={3}>
                <ControlLabel>Port</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="text"
                  value={fields.AniDB_ClientPort}
                  onChange={this.handleChange}
                />
              </Col>
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="AniDB_AVDumpKey">
              <Col sm={3}>
                <ControlLabel>AvDump Key</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="text"
                  value={fields.AniDB_AVDumpKey}
                  onChange={this.handleChange}
                />
              </Col>
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="AniDB_AVDumpClientPort">
              <Col sm={3}>
                <ControlLabel>AvDump Port</ControlLabel>
              </Col>
              <Col sm={9}>
                <FormControl
                  type="text"
                  value={fields.AniDB_AVDumpClientPort}
                  onChange={this.handleChange}
                />
              </Col>
              <FormControl.Feedback />
            </FormGroup>
          </Form>
        </FixedPanel>
      </Col>
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
