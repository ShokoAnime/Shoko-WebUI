// @flow
import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import Events from '../../core/events';
import { getSettings } from '../../core/actions/settings/Api';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import StyleSettings from './StyleSettings';
import LogOptions from './LogOptions';
import OtherSettings from './OtherSettings';
import ExportSettings from './ExportSettings';
import { uiVersion } from '../../core/util';

class SettingsPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${uiVersion()}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
      return;
    }

    store.dispatch({ type: Events.PAGE_SETTINGS_LOAD });

    store.dispatch(getSettings());
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
              <ExportSettings />
            </div>
          </section>
        </section>
      </Layout>
    );
  }
}

export default SettingsPage;
