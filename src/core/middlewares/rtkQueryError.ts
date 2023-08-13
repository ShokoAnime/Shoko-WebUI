import { isRejectedWithValue } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import toast from '@/components/Toast';
import Events from '@/core/events';

import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';

type ProblemDetails = {
  title: string;
  status: number;
  type: string;
  errors: Record<string, string[]>;
  traceId: string;
};

const isErrorObject = (target: any): target is ProblemDetails =>
  typeof target === 'object' && target !== null && typeof target.title === 'string' && typeof target.errors === 'object'
  && target.errors !== null;

const rtkQueryErrorLogger: Middleware = (_api: MiddlewareAPI) => dispatch => (action) => {
  if (isRejectedWithValue(action)) {
    // TODO: This needs to be better implemented
    if (action.payload.status === 401) {
      if (window.location.pathname !== '/webui/login') dispatch({ type: Events.STORE_CLEAR_STATE });
      toast.error('Unauthorized!', '', { toastId: 'unauthorized' });
    } else if (action.payload.originalStatus !== 503 && action.meta.arg.endpointName !== 'getRandomMetadata') {
      const { data } = action.payload;
      const endpointName = action.meta.arg.endpointName as string;
      const method = action.meta.baseQueryMeta.request.method as string;
      const url = new URL(action.meta.baseQueryMeta.request.url as string);
      const endpoint = `${method} ${url.pathname + url.search}`;
      if (isErrorObject(data)) {
        if (data.title === 'One or more validation errors occurred.') {
          forEach(
            Object.entries(data.errors),
            ([key, messageList]) =>
              forEach(
                messageList,
                message => toast.error(message, `Error for key "${key}" during \`${endpoint}\` (${endpointName})`),
              ),
          );
        }
      } else {
        toast.error(
          action.payload.error ?? `${action.payload.status} - ${action.error.message}`,
          `Error occured during \`${endpoint}\` (${endpointName})`,
        );
      }
    }
  }

  return dispatch(action);
};

export default rtkQueryErrorLogger;
