import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

import Events from '../events';
import toast from '@/components/Toast';

const rtkQueryErrorLogger: Middleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (api: MiddlewareAPI) => dispatch => (action) => {
    if (isRejectedWithValue(action)) {
      // TODO: This needs to be better implemented
      if (action.payload.status === 401) {
        if (window.location.pathname !== '/webui/login')
          dispatch({ type: Events.STORE_CLEAR_STATE });
        toast.error('Unauthorized!', '', { toastId: 'unauthorized' });
      } else if (action.payload.originalStatus !== 503 && action.meta.arg.endpointName !== 'getRandomMetadata') {
        toast.error(action.payload?.data?.title ?? action.payload.error ?? `${action.payload.status} - ${action.error.message}`, `Debug Info: ${action.meta.arg.endpointName}`);
      }
    }

    return dispatch(action);
  };

export default rtkQueryErrorLogger;
