import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import { getDeltaAsync } from '../../core/actions/logs/Delta';
import { setContents } from '../../core/actions/logs/Contents';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import LogSettings from './LogSettings';
import LogContents from './LogContents';

class LogsPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `JMM Server Web UI ${__VERSION__}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
    }

    // Fetch current log
    getDeltaAsync().then(() => {
      const newState = store.getState();
      store.dispatch(setContents(newState.logs.delta.items));
    });
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <InfoPanel title="Info Box Example" className="col-sm-12">
                <Panel>Here be logs!</Panel>
              </InfoPanel>
            </div>
            <LogSettings />
            <LogContents />
          </section>
        </section>
      </Layout>
    );
  }
}

export default LogsPage;
