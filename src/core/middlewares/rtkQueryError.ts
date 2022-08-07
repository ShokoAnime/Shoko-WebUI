import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';

const rtkQueryErrorLogger: Middleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (api: MiddlewareAPI) => next => (action) => {
    if (isRejectedWithValue(action)) {
      // TODO: This needs to be better implemented
      if (action.payload.status === 401) {
        toast.error('Unauthorized!');
      } else {
        toast.error(action.payload?.data?.title ?? action.payload.error ?? `${action.payload.status} - ${action.error.message}`);
      }
    }

    return next(action);
  };

export default rtkQueryErrorLogger;
