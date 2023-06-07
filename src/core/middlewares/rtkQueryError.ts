import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';

import toast from '@/components/Toast';
import Events from '../events';

const rtkQueryErrorLogger: Middleware = (_api: MiddlewareAPI) => dispatch => (action) => {
  if (isRejectedWithValue(action)) {
    // TODO: This needs to be better implemented
    if (action.payload.status === 401) {
      if (window.location.pathname !== '/webui/login') dispatch({ type: Events.STORE_CLEAR_STATE });
      toast.error('Unauthorized!', '', { toastId: 'unauthorized' });
    } else if (action.payload.originalStatus !== 503 && action.meta.arg.endpointName !== 'getRandomMetadata') {
      toast.error(action.payload?.data?.title ?? action.payload.error ?? `${action.payload.status} - ${action.error.message}`, `Debug Info: ${action.meta.arg.endpointName}`);
    }
  }

  return dispatch(action);
};

export default rtkQueryErrorLogger;
