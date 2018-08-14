// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Form, Col, FormGroup, FormControl,
} from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
import Events from '../../core/events';

import type { State } from '../../core/store';

type Props = {
  url?: string,
  saveSettings: ({}) => void,
  linkPlex: () => void,
}

type ComponentState = {
  url?: string,
  fields: {}
}

class PlexSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    url: PropTypes.string,
    saveSettings: PropTypes.func.isRequired,
    linkPlex: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleLink = () => {
    const { linkPlex } = this.props;
    linkPlex();
  };

  saveSettings = () => {
    const { fields } = this.state;
    const { saveSettings } = this.props;
    saveSettings(fields);
  };

  render() {
    const { url } = this.props;

    return (
      <Col lg={4}>
        <FixedPanel
          title="Plex Preferences"
          description="Plex preferences"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <FormGroup controlId="MAL_Username">
              <Col sm={12}>
                <FormControl
                  type="button"
                  value="Link"
                  onClick={this.handleLink}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="Plex_url">
              <Col sm={12}>
                {url}
              </Col>
            </FormGroup>
          </Form>
        </FixedPanel>
      </Col>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.plex,
  plex => ({
    url: plex.url,
  }),
);

function mapStateToProps(state: State): ComponentState {
  return selectComputedData(state);
}

function mapDispatchToProps(dispatch) {
  return {
    saveSettings: (value) => { dispatch({ type: Events.SETTINGS_SAVE_SERVER, payload: value }); },
    linkPlex: () => { dispatch({ type: Events.SETTINGS_PLEX_LOGIN_URL }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlexSettings);
