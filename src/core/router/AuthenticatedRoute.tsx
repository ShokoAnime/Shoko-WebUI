import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import { useGetInitStatusQuery } from '@/core/rtkQuery/splitV3Api/initApi';

import type { RootState } from '@/core/store';

type Props = {
  children: JSX.Element;
};

function AuthenticatedRoute(props: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.apiSession.apikey !== '');
  const serverStatus = useGetInitStatusQuery();
  const serverState = serverStatus.data?.State ?? 2;

  return (serverState === 2 && isAuthenticated)
    ? props.children
    : <Navigate to="/webui/login" replace />;
}

export default AuthenticatedRoute;
