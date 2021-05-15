/* eslint-disable react/prop-types */

import React from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';

import { RootState } from '../store';
import LoginPage from '../../pages/login/LoginPage';
import ErrorPage from '../../pages/error/ErrorPage';
import NoMatchPage from '../../pages/nomatch/index';
import MainPage from '../../pages/main/MainPage';
import FirstRunPage from '../../pages/firstrun/FirstRunPage';
import AuthenticatedRoute from './AuthenticatedRoute';

const Router = ({
  history,
  theme,
}) => (
  <div id="app-container" className={`${theme} flex h-screen`}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/firstrun" component={FirstRunPage} />
        <Route exact path="/error" component={ErrorPage} />
        <AuthenticatedRoute exact path="/index.html" component={MainPage} />
        <AuthenticatedRoute path="/" component={MainPage} />
        <Route component={NoMatchPage} />
      </Switch>
    </ConnectedRouter>
  </div>
);

const mapState = (state: RootState) => ({
  theme: state.webuiSettings.webui_v2.theme,
});

const connector = connect(mapState);

export default connector(Router);
