// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SettingsPanel from '../../components/Panels/SettingsPanel';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import SettingsSlider from '../../components/Buttons/SettingsSlider';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsAnidbImagesType } from '../../core/reducers/settings/Server';


type Props = {
  fields: SettingsAnidbImagesType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    DownloadCharacters?: boolean,
    DownloadCreators?: boolean,
    DownloadRelatedAnime: boolean,
    MaxRelationDepth: number,
  }
}

class AnidbImageSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      DownloadCharacters: PropTypes.bool,
      DownloadCreators: PropTypes.bool,
      DownloadRelatedAnime: PropTypes.bool,
      MaxRelationDepth: PropTypes.number,
    }),
    saveSettings: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleChange = (field: string, value: boolean | number) => {
    const { fields } = this.state;
    this.setState({ fields: Object.assign({}, fields, { [field]: value }) });
  };

  saveSettings = () => {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const { saveSettings } = this.props;
    const formFields = Object.assign({}, fields, stateFields);
    saveSettings({ context: 'AniDb', original: fields, changed: formFields });
  };

  render() {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="AniDB Download"
        onAction={this.saveSettings}
        form
      >
        <SettingsYesNoToggle
          name="DownloadCharacters"
          label="Character Images"
          value={formFields.DownloadCharacters}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="DownloadCreators"
          label="Creator Images"
          value={formFields.DownloadCreators}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="DownloadRelatedAnime"
          label="Related Anime"
          value={formFields.DownloadRelatedAnime}
          onChange={this.handleChange}
        />
        <SettingsSlider
          name="MaxRelationDepth"
          label="Relation Depth"
          value={formFields.MaxRelationDepth}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.AniDb,
  AniDB => ({
    DownloadCharacters: AniDB.DownloadCharacters,
    DownloadCreators: AniDB.DownloadCreators,
    DownloadRelatedAnime: AniDB.DownloadRelatedAnime,
    MaxRelationDepth: AniDB.MaxRelationDepth,
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

export default connect<ComponentState, {}>(mapStateToProps, mapDispatchToProps)(AnidbImageSettings);
