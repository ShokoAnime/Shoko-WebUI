// oxlint-disable-next-line no-restricted-imports -- this module is the sanctioned re-export point for the redux hooks
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { throttle } from 'lodash';

import Events from './events';
import { clearApiSession, clearSessionStorage, loadState, saveState } from './localStorage';
import reducers from './reducers';
import signalRMiddleware from './signalr/signalr';

import type { UnknownAction } from 'redux';

const rootReducer = (state: ReturnType<typeof reducers>, action: UnknownAction) => {
  if (action.type === Events.AUTH_LOGOUT) { // check for action type
    clearApiSession();
    clearSessionStorage();
    return reducers(undefined, action);
  }
  return reducers(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      signalRMiddleware,
    ),
  preloadedState: loadState(),
  devTools: import.meta.env.DEV,
});

export const useDispatch = useReduxDispatch.withTypes<typeof store.dispatch>();
export const useSelector = useReduxSelector.withTypes<RootState>();

setupListeners(store.dispatch);

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

export default store;
