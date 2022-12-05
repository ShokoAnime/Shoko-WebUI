import React from 'react';
import { Navigate  } from 'react-router';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { useGetInitStatusQuery } from '../rtkQuery/splitV3Api/initApi';

type Props = {
  children: JSX.Element;
};

function AuthenticatedRoute(props: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.apiSession.apikey !== '');
  const serverStatus = useGetInitStatusQuery();
  const serverState = serverStatus.data?.State ?? 2;

  return (serverState === 2 && isAuthenticated)
    ? props.children
    : (<Navigate to="/webui/login" replace />);
}

export default AuthenticatedRoute;
