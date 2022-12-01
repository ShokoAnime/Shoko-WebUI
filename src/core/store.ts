import { throttle } from 'lodash';
import { createRouterMiddleware } from '@lagunovsky/redux-react-router';
import { configureStore } from '@reduxjs/toolkit';
import signalrMiddleware from './middlewares/signalr';
import rtkQueryErrorMiddleware from './middlewares/rtkQueryError';
import { saveState, loadState } from './localStorage';
import createRootReducer from './reducers';
import history from './history';
import Events from './events';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { externalApi } from './rtkQuery/externalApi';
import { logsApi } from './rtkQuery/logsApi';
import { splitApi } from './rtkQuery/splitApi';
import { splitV3Api } from './rtkQuery/splitV3Api';
import { plexApi } from './rtkQuery/plexApi';

const combinedReducer = createRootReducer(history);
const rootReducer = (state, action) => {
  if (action.type === Events.STORE_CLEAR_STATE) { // check for action type
    // eslint-disable-next-line no-param-reassign
    state = {} as any;
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const routeMiddleware = createRouterMiddleware(history);

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
    routeMiddleware,
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
