// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
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
      <SettingsPanel
        title="Plex Preferences"
        onAction={this.saveSettings}
      >
        <Button
          text="Link"
          onClick={this.handleLink}
        />
        <span>{url}</span>
      </SettingsPanel>
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
