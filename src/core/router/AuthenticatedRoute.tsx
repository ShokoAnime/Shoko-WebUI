import React from 'react';
import { Route, Redirect } from 'react-router';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

type Props = {
  exact?: boolean;
  path: string;
  component: React.ComponentType<any>;
};

function AuthenticatedRoute(props: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.apiSession.apikey !== '');

  return isAuthenticated
    ? (<Route {...props} />)
    : (<Redirect to="/login" />);
}

export default AuthenticatedRoute;
