/* eslint-disable react/prop-types */

import React from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';

import { RootState } from '../store';
import LoginPage from '../../pages/login/index';
import ErrorPage from '../../pages/error/index';
import NoMatchPage from '../../pages/nomatch/index';
import MainPage from '../../pages/main/index';
// import ImportPage from '../../pages/dashboard/LayoutTabs/ImportFolders';
// import SettingsPage from '../../pages/settings/index';
// import ActionsPage from '../../pages/actions/index';
import FirstRunPage from '../../pages/firstrun/index';
import AuthenticatedRoute from './AuthenticatedRoute';

const Router = ({
  history,
  theme,
}) => (
  <div id="app-container" className={`${theme} flex h-screen`}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/index.html" component={LoginPage} />
        <Route exact path="/firstrun" component={FirstRunPage} />
        <Route exact path="/error" component={ErrorPage} />
        <AuthenticatedRoute exact path="/main" component={MainPage} />
        {/* <AuthenticatedRoute exact path="/import-folders" component={ImportPage} /> */}
        {/* <AuthenticatedRoute exact path="/settings" component={SettingsPage} />
        <AuthenticatedRoute exact path="/actions" component={ActionsPage} /> */}
        <Route component={NoMatchPage} />
      </Switch>
    </ConnectedRouter>
  </div>
);

const mapState = (state: RootState) => ({
  theme: state.webuiSettings.ui.theme,
});

const connector = connect(mapState);

export default connector(Router);
