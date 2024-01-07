import React, { type JSX } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

import { useServerStatusQuery } from '@/core/react-query/init/queries';

import type { RootState } from '@/core/store';

type Props = {
  children: JSX.Element;
};

function AuthenticatedRoute(props: Props) {
  const location = useLocation();
  const from = encodeURIComponent(location.pathname + location.search + location.hash);
  const isAuthenticated = useSelector((state: RootState) => state.apiSession.apikey !== '');
  const serverStatusQuery = useServerStatusQuery();
  const serverState = serverStatusQuery.data?.State ?? 2;

  return (serverState === 2 && isAuthenticated)
    ? props.children
    : <Navigate to={from === '/' || from === '/webui/' ? '/webui/login' : `/webui/login?redirectTo=${from}`} replace />;
}

export default AuthenticatedRoute;
