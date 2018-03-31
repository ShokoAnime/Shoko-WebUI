// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import history from '../../core/history';
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
import { uiVersion } from '../../core/util';

type Props = {
  apiKey: string,
  loadSettings: () => void,
}

class SettingsPage extends React.Component<Props> {
  static propTypes = {
    apiKey: PropTypes.string,
    loadSettings: PropTypes.func.isRequired,
  };

  componentDidMount() {
    document.title = `Shoko Server Web UI ${uiVersion()}`;
    const { apiKey, loadSettings } = this.props;
    if (apiKey === '') {
      history.push('/');
      return;
    }
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
            <div className="row">
              <AnidbLoginSettings />
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

function mapStateToProps(state) {
  const { apiKey } = state.apiSession;
  return {
    apiKey,
  };
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

