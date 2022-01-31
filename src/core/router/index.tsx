/* eslint-disable react/prop-types */

import React from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { useSelector } from 'react-redux';
import type { History } from 'history';

import { RootState } from '../store';
import LoginPage from '../../pages/login/LoginPage';
import ErrorPage from '../../pages/error/ErrorPage';
import NoMatchPage from '../../pages/nomatch/index';
import MainPage from '../../pages/main/MainPage';
import FirstRunPage from '../../pages/firstrun/FirstRunPage';
import AuthenticatedRoute from './AuthenticatedRoute';

type Props = {
  history: History<any>;
};

function Router(props: Props) {
  const theme = useSelector((state: RootState) => state.webuiSettings.webui_v2.theme);

  const { history } = props;

  return (
    <div id="app-container" className={`${theme} theme-shoko-blue flex h-screen`}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/error" component={ErrorPage} />
          <Route path="/firstrun" component={FirstRunPage} />
          <AuthenticatedRoute exact path="/index.html" component={MainPage} />
          <AuthenticatedRoute path="/" component={MainPage} />
          <Route component={NoMatchPage} />
        </Switch>
      </ConnectedRouter>
    </div>
  );
}

export default Router;
