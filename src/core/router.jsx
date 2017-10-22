import React from 'react';
import { Route } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import history from './history';
import LoginPage from '../pages/login';
import ErrorPage from '../pages/error';
import DashboardPage from '../pages/main';
import ImportPage from '../pages/import';
import SettingsPage from '../pages/settings';
import LogsPage from '../pages/logs';
import FirstRunPage from '../pages/firstrun';

export default class Router extends React.Component {
  render() {
    return (
      <ConnectedRouter history={history} basename="/webui">
        <div className="site-wrapper">
          <Route exact path="/" component={LoginPage} />
          <Route exact path="/index.html" component={LoginPage} />
          <Route exact path="/firstrun" component={FirstRunPage} />
          <Route exact path="/error" component={ErrorPage} />
          <Route exact path="/dashboard" component={DashboardPage} />
          <Route exact path="/import-folders" component={ImportPage} />
          <Route exact path="/settings" component={SettingsPage} />
          <Route exact path="/logs" component={LogsPage} />
        </div>
      </ConnectedRouter>
    );
  }
}
