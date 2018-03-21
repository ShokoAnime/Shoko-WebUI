// @flow
import React from 'react';
import { connect } from 'react-redux';
import store from '../../core/store';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import Overview from './Overview';
import Commands from './Commands';
import RecentFiles from './RecentFiles';
import News from './News';
import ImportFolders from './ImportFolders';
import QuickActions from './QuickActions';
import { uiVersion } from '../../core/util';
import type { State } from '../../core/store';

type Props = {
  apiKey: string,
  autoUpdate: boolean,
  logout: () => void,
  stopPolling: () => void,
}

class MainPage extends React.Component<Props> {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${uiVersion()}`;

    const { apiKey, logout } = this.props;

    if (apiKey === '') {
      logout();
      return;
    }

    store.dispatch({ type: Events.DASHBOARD_LOAD, payload: null });
  }

  componentWillUnmount() {
    const { autoUpdate, stopPolling } = this.props;
    if (autoUpdate) {
      stopPolling();
    }
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <Commands className="col-sm-4 fa-icon-20" />
              <RecentFiles className="col-sm-8" />
            </div>
            <div className="row">
              <News className="col-sm-4" />
              <QuickActions className="col-sm-4" />
              <ImportFolders className="col-sm-4" />
            </div>
          </section>
        </section>
      </Layout>
    );
  }
}

function mapStateToProps(state: State) {
  const { autoUpdate, apiSession } = state;

  return {
    apiKey: apiSession.apikey,
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch({ type: Events.LOGOUT }),
    stopPolling: () => dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'auto-refresh' } }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
