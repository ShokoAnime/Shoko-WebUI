import { isAxiosError } from 'axios';

import { useServerRestartMutation, useServerShutdownMutation } from '@/core/react-query/init/mutations';
import { clearAction, setAction } from '@/core/slices/serverLifecycle';
import { useDispatch } from '@/core/store';
import toast from '@/core/toast';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { ServerLifecycleAction } from '@/core/slices/serverLifecycle';

const isNetworkError = (error: unknown) => {
  if (!isAxiosError(error)) return false;
  return !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
};

// Restart and shutdown requests that hand over to the status page, which follows the server until it is back.
const useServerLifecycleActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();
  const { isPending: isRestarting, mutateAsync: requestRestart } = useServerRestartMutation();
  const { isPending: isShuttingDown, mutateAsync: requestShutdown } = useServerShutdownMutation();

  const run = async (action: ServerLifecycleAction, request: () => Promise<unknown>, errorMessage: string) => {
    dispatch(setAction(action));
    try {
      await request();
      navigate('/webui/status');
    } catch (error) {
      console.error(error);
      if (isNetworkError(error)) {
        // Server likely dropped the connection mid-request; treat as success
        navigate('/webui/status');
        return;
      }
      dispatch(clearAction());
      toast.error(errorMessage);
    }
  };

  return {
    isRestarting,
    isShuttingDown,
    restart: () => run('restarting', () => requestRestart(undefined), 'Failed to restart Shoko'),
    shutdown: () => run('shutting-down', () => requestShutdown(undefined), 'Failed to shutdown Shoko'),
  };
};

export default useServerLifecycleActions;
