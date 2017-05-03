import React from 'react';
import history from '../../core/history';
import store from '../../core/store';
import Events from '../../core/events';
import {
  setAutoupdate,
} from '../../core/actions';
import Layout from '../../components/Layout/Layout';
import Overview from './Overview';
import Commands from './Commands';
import RecentFiles from './RecentFiles';
import News from './News';
import ImportFolders from './ImportFolders';
import QuickActions from './QuickActions';

class MainPage extends React.Component {
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

    store.dispatch({ type: Events.DASHBOARD_LOAD });
  }

  componentWillUnmount() {
    setAutoupdate(false);
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <Commands className="col-sm-4" />
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

export default MainPage;
