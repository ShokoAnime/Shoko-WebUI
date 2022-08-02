import React from 'react';
import { Navigate  } from 'react-router';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

type Props = {
  children: JSX.Element;
};

function AuthenticatedRoute(props: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.apiSession.apikey !== '');

  return isAuthenticated
    ? props.children
    : (<Navigate to="/webui/login" replace />);
}

export default AuthenticatedRoute;
