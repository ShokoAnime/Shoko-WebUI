/* eslint-disable react/prop-types */

import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { ReduxRouter } from '@lagunovsky/redux-react-router';
import { useSelector } from 'react-redux';
import type { BrowserHistory, History } from 'history';

import { RootState } from '../store';
import LoginPage from '../../pages/login/LoginPage';
import ErrorPage from '../../pages/error/ErrorPage';
import MainPage from '../../pages/main/MainPage';
import FirstRunPage from '../../pages/firstrun/FirstRunPage';
import AuthenticatedRoute from './AuthenticatedRoute';

type Props = {
  history: BrowserHistory;
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/firstrun/*" element={<FirstRunPage />} />
          <Route index element={<AuthenticatedRoute><MainPage /></AuthenticatedRoute>}/>
          <Route path="*" element={<AuthenticatedRoute><MainPage /></AuthenticatedRoute>}/>
        </Routes>
      </ReduxRouter>
    </div>
  );
}

export default Router;
