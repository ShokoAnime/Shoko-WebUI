// @flow
/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Form, Col } from 'react-bootstrap';
import { createSelector } from 'reselect';
import FixedPanel from '../../components/Panels/FixedPanel';
import SettingsYesNoToggle from '../../components/Buttons/SettingsYesNoToggle';
import Events from '../../core/events';

import type { State } from '../../core/store';
import type { SettingsAnidbImagesType, SettingBoolean } from '../../core/reducers/settings/Server';


type Props = {
  fields: SettingsAnidbImagesType,
  saveSettings: ({}) => void,
}

type ComponentState = {
  fields: SettingsAnidbImagesType
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
      fields: Object.assign({}, props.fields),
    };
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps === this.props) return;
    this.setState({ fields: Object.assign({}, this.props.fields) });
  };

  handleChange = (field: string, value: SettingBoolean) => {
    this.setState({ fields: Object.assign({}, this.state.fields, { [field]: value }) });
  };

  saveSettings = () => {
    this.props.saveSettings(this.state.fields);
  };

  render() {
    const fields = Object.assign({}, this.props.fields, this.state.fields);

    return (
      <Col lg={4}>
        <FixedPanel
          title="AniDB Download"
          description="AniDB download settings"
          actionName="Save"
          onAction={this.saveSettings}
          form
        >
          <Form horizontal>
            <SettingsYesNoToggle
              name="AniDB_DownloadCharacters"
              label="Character Images"
              value={fields.AniDB_DownloadCharacters}
              onChange={this.handleChange}
            />
            <SettingsYesNoToggle
              name="AniDB_DownloadCreators"
              label="Creator Images"
              value={fields.AniDB_DownloadCreators}
              onChange={this.handleChange}
            />
            <SettingsYesNoToggle
              name="AniDB_DownloadReviews"
              label="Reviews"
              value={fields.AniDB_DownloadReviews}
              onChange={this.handleChange}
            />
            <SettingsYesNoToggle
              name="AniDB_DownloadReleaseGroups"
              label="Release Groups"
              value={fields.AniDB_DownloadReleaseGroups}
              onChange={this.handleChange}
            />
          </Form>
        </FixedPanel>
      </Col>
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
