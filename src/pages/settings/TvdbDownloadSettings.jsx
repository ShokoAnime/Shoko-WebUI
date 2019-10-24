// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsTvdbDownloadType, SettingBoolean } from '../../core/reducers/settings/Server';

type Props = {
  fields: SettingsTvdbDownloadType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    AutoFanart?: boolean,
    AutoPosters?: boolean,
    AutoWideBanners?: boolean,
    AutoLink?: boolean,
  }
}

class TvdbDownloadSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      AutoFanart: PropTypes.bool,
      AutoPosters: PropTypes.bool,
      AutoWideBanners: PropTypes.bool,
      AutoLink: PropTypes.bool,
    }),
    saveSettings: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleChange = (field: string, value: SettingBoolean) => {
    const { fields } = this.state;
    this.setState({ fields: Object.assign({}, fields, { [field]: value }) });
  };

  saveSettings = () => {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const { saveSettings } = this.props;
    const formFields = Object.assign({}, fields, stateFields);
    saveSettings({ context: 'TvDB', original: fields, changed: formFields });
  };

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="TvDB download"
        description="TvDB image download settings"
        actionName="Save"
        onAction={this.saveSettings}
        form
      >
        <SettingsYesNoToggle
          name="AutoFanart"
          label="Fanart"
          value={formFields.AutoFanart}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AutoPosters"
          label="Posters"
          value={formFields.AutoPosters}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AutoWideBanners"
          label="Wide Banners"
          value={formFields.AutoWideBanners}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AutoLink"
          label="Auto link"
          value={formFields.AutoLink}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.TvDB,
  server => ({
    AutoFanart: server.AutoFanart,
    AutoPosters: server.AutoPosters,
    AutoWideBanners: server.AutoWideBanners,
    AutoLink: server.AutoLink,
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

export default connect(mapStateToProps, mapDispatchToProps)(TvdbDownloadSettings);
