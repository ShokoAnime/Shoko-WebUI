import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { throttle } from 'lodash';

import Events from './events';
import { clearApiSession, clearSessionStorage, loadState, saveState } from './localStorage';
// eslint-disable-next-line import-x/no-rename-default
import combinedReducer from './reducers';
import signalRMiddleware from './signalr/signalr';

import type { UnknownAction } from 'redux';

const rootReducer = (state: ReturnType<typeof combinedReducer>, action: UnknownAction) => {
  if (action.type === Events.AUTH_LOGOUT) { // check for action type
    clearApiSession();
    clearSessionStorage();
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      signalRMiddleware,
    ),
  preloadedState: loadState(),
  // eslint-disable-next-line no-undef
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

export default store;
