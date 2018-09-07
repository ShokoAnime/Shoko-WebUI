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
import type { SettingsAnidbImagesType, SettingBoolean } from '../../core/reducers/settings/Server';

type Props = {
  fields: SettingsAnidbImagesType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    AniDB_DownloadCharacters?: SettingBoolean,
    AniDB_DownloadCreators?: SettingBoolean,
    AniDB_DownloadReviews?: SettingBoolean,
    AniDB_DownloadReleaseGroups?: SettingBoolean,
  }
}

class AnidbImageSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      AniDB_DownloadCharacters: PropTypes.oneOf(['True', 'False']),
      AniDB_DownloadCreators: PropTypes.oneOf(['True', 'False']),
      AniDB_DownloadReviews: PropTypes.oneOf(['True', 'False']),
      AniDB_DownloadReleaseGroups: PropTypes.oneOf(['True', 'False']),
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
        title="AniDB Images"
        onAction={this.saveSettings}
        form
      >
        <SettingsYesNoToggle
          name="AniDB_DownloadCharacters"
          label="Character Images"
          value={formFields.AniDB_DownloadCharacters}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AniDB_DownloadCreators"
          label="Creator Images"
          value={formFields.AniDB_DownloadCreators}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AniDB_DownloadReviews"
          label="Reviews"
          value={formFields.AniDB_DownloadReviews}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AniDB_DownloadReleaseGroups"
          label="Release Groups"
          value={formFields.AniDB_DownloadReleaseGroups}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server,
  server => ({
    AniDB_DownloadCharacters: server.AniDB_DownloadCharacters,
    AniDB_DownloadCreators: server.AniDB_DownloadCreators,
    AniDB_DownloadReviews: server.AniDB_DownloadReviews,
    AniDB_DownloadReleaseGroups: server.AniDB_DownloadReleaseGroups,
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

export default connect(mapStateToProps, mapDispatchToProps)(AnidbImageSettings);
