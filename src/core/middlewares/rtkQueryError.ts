import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';

import Events from '../events';
import toast from '../../components/Toast';

import type { RootState } from '../store';

const rtkQueryErrorLogger: Middleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (api: MiddlewareAPI) => dispatch => (action) => {
    if (isRejectedWithValue(action)) {
      const state = api.getState() as RootState;
      // TODO: This needs to be better implemented
      if (action.payload.status === 401) {
        if (state.router.location.pathname !== '/webui/login')
          dispatch({ type: Events.STORE_CLEAR_STATE });
        toast.error('Unauthorized!', '', { toastId: 'unauthorized' });
      } else if (action.payload.originalStatus !== 503) {
        toast.error(action.payload?.data?.title ?? action.payload.error ?? `${action.payload.status} - ${action.error.message}`, `Debug Info: ${action.meta.arg.endpointName}`);
      }
    }

    return dispatch(action);
  };

export default rtkQueryErrorLogger;
