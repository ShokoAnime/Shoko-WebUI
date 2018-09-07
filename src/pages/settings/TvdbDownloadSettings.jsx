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
    TvDB_AutoFanart?: SettingBoolean,
    TvDB_AutoPosters?: SettingBoolean,
    TvDB_AutoWideBanners?: SettingBoolean,
    TvDB_AutoLink?: SettingBoolean,
  }
}

class TvdbDownloadSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      TvDB_AutoFanart: PropTypes.oneOf(['True', 'False']),
      TvDB_AutoPosters: PropTypes.oneOf(['True', 'False']),
      TvDB_AutoWideBanners: PropTypes.oneOf(['True', 'False']),
      TvDB_AutoLink: PropTypes.oneOf(['True', 'False']),
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
    const { fields } = this.state;
    const { saveSettings } = this.props;
    saveSettings(fields);
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
          name="TvDB_AutoFanart"
          label="Fanart"
          value={formFields.TvDB_AutoFanart}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="TvDB_AutoPosters"
          label="Posters"
          value={formFields.TvDB_AutoPosters}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="TvDB_AutoWideBanners"
          label="Wide Banners"
          value={formFields.TvDB_AutoWideBanners}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="TvDB_AutoLink"
          label="Auto link"
          value={formFields.TvDB_AutoLink}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server,
  server => ({
    TvDB_AutoFanart: server.TvDB_AutoFanart,
    TvDB_AutoPosters: server.TvDB_AutoPosters,
    TvDB_AutoWideBanners: server.TvDB_AutoWideBanners,
    TvDB_AutoLink: server.TvDB_AutoLink,
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
