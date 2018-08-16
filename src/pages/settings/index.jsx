// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import Events from '../../core/events';
import { getSettings } from '../../core/actions/settings/Api';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
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
import { uiVersion } from '../../core/util';

type Props = {
  loadSettings: () => void,
}

class SettingsPage extends React.Component<Props> {
  static propTypes = {
    loadSettings: PropTypes.func.isRequired,
  };

  componentDidMount() {
    document.title = `Shoko Server Web UI ${uiVersion()}`;
    const { loadSettings } = this.props;
    loadSettings();
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <InfoPanel title="Info Box Example" className="col-sm-12">
                <Panel>
                  On this page you can change some Web UI or server settings.
                </Panel>
              </InfoPanel>
            </div>
            <div className="row">
              <StyleSettings className="col-sm-4" />
              <LogOptions className="col-sm-4" />
              <OtherSettings className="col-sm-4" />
            </div>
            <div className="row flex">
              <AnidbLoginSettings />
              <AnidbImageSettings />
              <AnidbMylistSettings />
            </div>
            <div className="row">
              <AnidbUpdateSettings />
              <TvdbDownloadSettings />
              <TvdbPrefsSettings />
            </div>
            <div className="row">
              <TraktSettings />
              <PlexSettings />
              <MoviedbSettings />
            </div>
            <div className="row">
              <ExportSettings />
            </div>
          </section>
        </section>
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
