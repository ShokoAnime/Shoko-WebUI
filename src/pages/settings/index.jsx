// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Section, Columns } from 'react-bulma-components';
import Events from '../../core/events';
import { getSettings } from '../../core/actions/settings/Api';
import Layout from '../../components/Layout/Layout';
import Overview from '../dashboard/Overview';
import StyleSettings from './StyleSettings';
import LogOptions from './LogOptions';
import OtherSettings from './OtherSettings';
import ExportSettings from './ExportSettings';
import AnidbLoginSettings from './AnidbLoginSettings';
import AnidbImageSettings from './AnidbImageSettings';
import AnidbMylistSettings from './AnidbMylistSettings';
import AnidbUpdateSettings from './AnidbUpdateSettings';
import TvdbDownloadSettings from './TvdbDownloadSettings';
import TvdbPrefsSettings from './TvdbPrefsSettings';
import TraktSettings from './TraktSettings';
import PlexSettings from './PlexSettings';
import MoviedbSettings from './MoviedbSettings';

type Props = {
  loadSettings: () => void,
}

class SettingsPage extends React.Component<Props> {
  static propTypes = {
    loadSettings: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { loadSettings } = this.props;
    loadSettings();
  }

  render() {
    return (
      <Layout>
        <Section className="settings page-wrap">
          <Overview />
          <Columns>
            <Columns.Column>
              <StyleSettings />
            </Columns.Column>
            <Columns.Column>
              <LogOptions />
            </Columns.Column>
            <Columns.Column>
              <OtherSettings />
            </Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column>
              <AnidbLoginSettings />
            </Columns.Column>
            <Columns.Column>
              <AnidbImageSettings />
            </Columns.Column>
            <Columns.Column>
              <AnidbMylistSettings />
            </Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column><AnidbUpdateSettings /></Columns.Column>
            <Columns.Column><TvdbDownloadSettings /></Columns.Column>
            <Columns.Column><TvdbPrefsSettings /></Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column><TraktSettings /></Columns.Column>
            <Columns.Column><PlexSettings /></Columns.Column>
            <Columns.Column><MoviedbSettings /></Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column><ExportSettings /></Columns.Column>
          </Columns>
        </Section>
      </Layout>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    loadSettings: () => {
      dispatch({ type: Events.PAGE_SETTINGS_LOAD, payload: null });
      dispatch(getSettings());
      dispatch({ type: Events.SETTINGS_GET_SERVER, payload: null });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
