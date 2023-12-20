/* global globalThis */
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { throttle } from 'lodash';

import Events from './events';
import { loadState, saveState } from './localStorage';
import signalrMiddleware from './middlewares/signalr';
import combinedReducer from './reducers';

const rootReducer = (state, action) => {
  if (action.type === Events.STORE_CLEAR_STATE) { // check for action type
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
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
