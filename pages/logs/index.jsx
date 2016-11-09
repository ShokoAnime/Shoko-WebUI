import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import { getDeltaAsync } from '../../core/actions/logs/Delta';
import { setContents } from '../../core/actions/logs/Contents';
import { setAutoupdate } from '../../core/actions';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import LogSettings from './LogSettings';
import LogContents from './LogContents';

class LogsPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${__VERSION__}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
      return;
    }

    // Fetch current log
    getDeltaAsync().then(() => {
      const newState = store.getState();
      store.dispatch(setContents(newState.logs.delta.items));
    });

    if (state.autoUpdate) {
      // Re-enable auto update if it was active
      store.dispatch(setAutoupdate(true));
    }
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <InfoPanel title="Interactive Log" className="col-sm-12">
                <Panel>Log is displayed in the tab below, filtering by event type and keyword is
                  possible. To filter the results, make the changes and press Apply button.
                  Initially only first 10 lines are displayed, if auto-update is enabled server is
                  continuously polled and more lines are loaded.
                </Panel>
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
