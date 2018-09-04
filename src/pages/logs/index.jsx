// @flow
import React from 'react';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import Events from '../../core/events';
import { getDelta } from '../../core/actions/logs/Delta';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../dashboard/Overview';
import LogSettings from './LogSettings';
import LogContents from './LogContents';
import { uiVersion } from '../../core/util';
import type { State } from '../../core/store';

type Props = {
  autoUpdate: boolean,
  logsLoad: () => void,
  startPolling: () => void,
  updateDelta: (number) => void,
}

class LogsPage extends React.Component<Props> {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${uiVersion()}`;

    const {
      logsLoad, startPolling, updateDelta, autoUpdate,
    } = this.props;

    logsLoad();
    // Reset buffer and fetch current log
    updateDelta(0);

    if (autoUpdate) {
      // Re-enable auto update if it was active
      startPolling();
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
                <Panel>
                  Log is displayed in the tab below, filtering by event type and keyword is
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

function mapStateToProps(state: State) {
  const { autoUpdate } = state;

  return {
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateDelta: () => dispatch(getDelta()),
    startPolling: () => dispatch({ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } }),
    logsLoad: () => dispatch({ type: Events.PAGE_LOGS_LOAD, payload: null }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogsPage);
