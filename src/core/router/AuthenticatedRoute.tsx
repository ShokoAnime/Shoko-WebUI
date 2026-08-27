import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useServerStatusQuery } from '@/core/react-query/init/queries';
import { useSelector } from '@/core/store';
import StatusPage from '@/pages/StatusPage';

type Props = {
  children: ReactNode;
};

const AuthenticatedRoute = ({ children }: Props) => {
  const location = useLocation();
  const from = encodeURIComponent(location.pathname + location.search + location.hash);
  const isAuthenticated = useSelector(state => state.apiSession.apikey !== '');
  const serverLifecycle = useSelector(state => state.serverLifecycle);
  const serverStatusQuery = useServerStatusQuery();
  const serverState = serverStatusQuery.data?.State;

  const loginRedirect = from === '/' || from === '/webui/'
    ? '/webui/login'
    : `/webui/login?redirectTo=${from}`;

  // Unreachable server wins over stale cached state.
  if (serverStatusQuery.isError) return <StatusPage />;
  // A user-initiated restart/shutdown must not be interrupted by route guards.
  if (serverLifecycle.action !== 'idle') return <StatusPage />;
  if (serverState === 'Waiting') return <Navigate to="/webui/login" replace />;
  if (serverState === 'Started') {
    return isAuthenticated ? children : <Navigate to={loginRedirect} replace />;
  }
  if (serverState === 'Starting' || serverState === 'Failed') return <StatusPage />;
  // State not yet loaded — optimistically render children when authenticated.
  return isAuthenticated ? children : <Navigate to={loginRedirect} replace />;
};

export default AuthenticatedRoute;
