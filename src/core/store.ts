import { throttle } from 'lodash';
import { configureStore } from '@reduxjs/toolkit';
import signalrMiddleware from './middlewares/signalr';
import rtkQueryErrorMiddleware from './middlewares/rtkQueryError';
import { loadState, saveState } from './localStorage';
import combinedReducer from './reducers';
import Events from './events';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { externalApi } from './rtkQuery/externalApi';
import { logsApi } from './rtkQuery/logsApi';
import { splitApi } from './rtkQuery/splitApi';
import { splitV3Api } from './rtkQuery/splitV3Api';
import { plexApi } from './rtkQuery/plexApi';

const rootReducer = (state, action) => {
  if (action.type === Events.STORE_CLEAR_STATE) { // check for action type
    // eslint-disable-next-line no-param-reassign
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
    rtkQueryErrorMiddleware,
    splitV3Api.middleware,
    splitApi.middleware,
    externalApi.middleware,
    logsApi.middleware,
    plexApi.middleware,
    signalrMiddleware,
  ),
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

export default store;
