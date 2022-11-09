import createSagaMiddleware from 'redux-saga';
import { throttle } from 'lodash';
import { createRouterMiddleware } from '@lagunovsky/redux-react-router';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import signalrMiddleware from './middlewares/signalr';
import rtkQueryErrorMiddleware from './middlewares/rtkQueryError';
import { saveState, loadState } from './localStorage';
import createRootReducer from './reducers';
import rootSaga from './sagas';
import history from './history';
import Events from './events';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { dashboardApi } from './rtkQuery/dashboardApi';
import { externalApi } from './rtkQuery/externalApi';
import { collectionApi } from './rtkQuery/collectionApi';
import { episodeApi } from './rtkQuery/episodeApi';
import { logsApi } from './rtkQuery/logsApi';
import { importFolderApi } from './rtkQuery/importFolderApi';
import { seriesApi } from './rtkQuery/seriesApi';
import { fileApi } from './rtkQuery/fileApi';
import { settingsApi } from './rtkQuery/settingsApi';
import { userApi } from './rtkQuery/userApi';
import { traktApi } from './rtkQuery/traktApi';
import { webuiApi } from './rtkQuery/webuiApi';
import { initApi } from './rtkQuery/initApi';
import { authApi } from './rtkQuery/authApi';
import { queueApi } from './rtkQuery/queueApi';

const combinedReducer = createRootReducer(history);
const rootReducer = (state, action) => {
  if (action.type === Events.STORE_CLEAR_STATE) { // check for action type
    // eslint-disable-next-line no-param-reassign
    state = {} as any;
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = createRouterMiddleware(history);
const middleware = [
  ...getDefaultMiddleware(),
  routeMiddleware,
  sagaMiddleware,
  signalrMiddleware,
  rtkQueryErrorMiddleware,
  dashboardApi.middleware,
  externalApi.middleware,
  collectionApi.middleware,
  logsApi.middleware,
  importFolderApi.middleware,
  seriesApi.middleware,
  fileApi.middleware,
  settingsApi.middleware,
  userApi.middleware,
  traktApi.middleware,
  webuiApi.middleware,
  episodeApi.middleware,
  initApi.middleware,
  authApi.middleware,
  queueApi.middleware,
];

const store = configureStore({
  reducer: rootReducer,
  middleware,
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

sagaMiddleware.run(rootSaga);

export default store;
