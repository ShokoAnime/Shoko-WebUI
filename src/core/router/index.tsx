/* eslint-disable react/prop-types */

import React from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import LoginPage from '../../pages/login/index';
import ErrorPage from '../../pages/error/index';
import NoMatchPage from '../../pages/nomatch/index';
import DashboardPage from '../../pages/dashboard/index';
// import ImportPage from '../../pages/import/index';
// import SettingsPage from '../../pages/settings/index';
// import ActionsPage from '../../pages/actions/index';
// import FirstRunPage from '../../pages/firstrun/index';
import AuthenticatedRoute from './AuthenticatedRoute';

const Router = ({
  history,
  theme,
}) => (
  <div id="app-container" className={theme}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/index.html" component={LoginPage} />
        {/* <Route exact path="/firstrun" component={FirstRunPage} /> */}
        <Route exact path="/error" component={ErrorPage} />
        <AuthenticatedRoute exact path="/dashboard" component={DashboardPage} />
        {/* <AuthenticatedRoute exact path="/import-folders" component={ImportPage} />
        <AuthenticatedRoute exact path="/settings" component={SettingsPage} />
        <AuthenticatedRoute exact path="/actions" component={ActionsPage} /> */}
        <Route component={NoMatchPage} />
      </Switch>
    </ConnectedRouter>
  </div>
);

const mapStateToProps = (state) => {
  const {
    theme,
  } = state.settings.ui;
  return { theme };
};
export default connect(mapStateToProps)(Router);
