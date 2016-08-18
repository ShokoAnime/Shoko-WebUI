import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import { updateSettings } from '../../core/actions';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import StyleSettings from './StyleSettings';
import LogOptions from './LogOptions';

class SettingsPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `JMM Server Web UI ${__VERSION__}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
    }

    const settings = {
      theme: 'light',
      notifications: false,
      logRotation: true,
      compressLogs: 'weekly',
      deleteLogs: false,
      deleteLogsInterval: 'monthly',
    };

    store.dispatch(updateSettings(settings));
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
                Very long text explaining what to with this page. Very long text explaining
                what to with this page. Very long text explaining what to with this page. Very
                long text explaining what to with this page. Very long text explaining what to
                with this page. Very long text explaining what to with this page. Very long text
                explaining what to with this page. Very long text explaining what to with this page.
                </Panel>
              </InfoPanel>
            </div>
            <div className="row">
              <StyleSettings className="col-sm-4" />
              <LogOptions className="col-sm-4" />
            </div>
          </section>
        </section>
      </Layout>
    );
  }
}

export default SettingsPage;
