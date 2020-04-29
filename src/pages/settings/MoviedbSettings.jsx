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
import type { SettingsMoviedbType } from '../../core/reducers/settings/Server';

type Props = {
  fields: SettingsMoviedbType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: {
    AutoFanart?: boolean,
    AutoFanartAmount?: number,
    AutoPosters?: boolean,
    AutoPostersAmount?: number,
  }
}

class MoviedbSettings extends React.PureComponent<Props, ComponentState> {
  static propTypes = {
    fields: PropTypes.shape({
      AutoFanart: PropTypes.bool,
      AutoFanartAmount: PropTypes.number,
      AutoPosters: PropTypes.bool,
      AutoPostersAmount: PropTypes.number,
    }),
    saveSettings: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fields: {},
    };
  }

  handleChange = (field: string, value: string) => {
    const { fields } = this.state;
    this.setState({ fields: Object.assign({}, fields, { [field]: value }) });
  };

  saveSettings = () => {
    const { fields } = this.props;
    const { fields: stateFields } = this.state;
    const { saveSettings } = this.props;
    const formFields = Object.assign({}, fields, stateFields);
    saveSettings({ context: 'MovieDb', original: fields, changed: formFields });
  };

  render() {
    const { fields: stateFields } = this.state;
    const { fields } = this.props;
    const formFields = Object.assign({}, fields, stateFields);

    return (
      <SettingsPanel
        title="MovieDB settings"
        description="MovieDB image download settings"
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
        <SettingsSlider
          name="AutoFanartAmount"
          label="Max Posters"
          value={formFields.AutoFanartAmount}
          onChange={this.handleChange}
        />
        <SettingsYesNoToggle
          name="AutoPosters"
          label="Posters"
          value={formFields.AutoPosters}
          onChange={this.handleChange}
        />
        <SettingsSlider
          name="AutoPostersAmount"
          label="Max Posters"
          value={formFields.AutoPostersAmount}
          onChange={this.handleChange}
        />
      </SettingsPanel>
    );
  }
}

const selectComputedData = createSelector(
  state => state.settings.server.MovieDb,
  server => ({
    AutoFanart: server.AutoFanart,
    AutoFanartAmount: server.AutoFanartAmount,
    AutoPosters: server.AutoPosters,
    AutoPostersAmount: server.AutoPostersAmount,
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviedbSettings);
