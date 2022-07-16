/* eslint-disable react/prop-types */

import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
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
  useEffect(() => {
    document.body.className = 'theme-shoko-blue';
  }, []);

  const { history } = props;

  return (
    <div id="app-container" className={`${theme} theme-shoko-blue flex h-screen`}>
      <ReduxRouter history={history}>
        <Routes>
          <Route path="/login" element={LoginPage} />
          <Route path="/error" element={ErrorPage} />
          <Route path="/firstrun/*" element={FirstRunPage} />
          <Route path="/index.html" element={() => <AuthenticatedRoute><MainPage /></AuthenticatedRoute>} />
          <Route path="/*" element={() => <AuthenticatedRoute><MainPage /></AuthenticatedRoute>} />
          <Route element={NoMatchPage} />
        </Routes>
      </ReduxRouter>
    </div>
  );
}

export default Router;
