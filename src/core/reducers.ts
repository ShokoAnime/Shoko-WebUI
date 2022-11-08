import { combineReducers } from 'redux';
import { createRouterReducer } from '@lagunovsky/redux-react-router';
import { handleAction } from 'redux-actions';
import {
  SET_AUTOUPDATE,
} from './actions';

import apiSessionReducer from './slices/apiSession';
import fetchingReducer from './slices/fetching';
import firstrunReducer from './slices/firstrun';
import mainpageReducer from './slices/mainpage';
import miscReducer from './slices/misc';
import modalsReducer from './slices/modals';
import collectionReducer from './slices/collection';
import utilitiesReducer from './slices/utilities';

import { dashboardApi } from './rtkQuery/dashboardApi';
import { externalApi } from './rtkQuery/externalApi';
import { collectionApi } from './rtkQuery/collectionApi';
import { logsApi } from './rtkQuery/logsApi';
import { importFolderApi } from './rtkQuery/importFolderApi';
import { seriesApi } from './rtkQuery/seriesApi';
import { fileApi } from './rtkQuery/fileApi';
import { actionsApi } from './rtkQuery/actionsApi';
import { episodeApi } from './rtkQuery/episodeApi';
import { settingsApi } from './rtkQuery/settingsApi';
import { userApi } from './rtkQuery/userApi';
import { traktApi } from './rtkQuery/traktApi';
import { webuiApi } from './rtkQuery/webuiApi';
import { initApi } from './rtkQuery/initApi';
import { authApi } from './rtkQuery/authApi';
import { queueApi } from './rtkQuery/queueApi';

const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);

const reducers = {
  apiSession: apiSessionReducer,
  fetching: fetchingReducer,
  firstrun: firstrunReducer,
  mainpage: mainpageReducer,
  misc: miscReducer,
  modals: modalsReducer,
  autoUpdate,
  collection: collectionReducer,
  utilities: utilitiesReducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [externalApi.reducerPath]: externalApi.reducer,
  [collectionApi.reducerPath]: collectionApi.reducer,
  [logsApi.reducerPath]: logsApi.reducer,
  [importFolderApi.reducerPath]: importFolderApi.reducer,
  [seriesApi.reducerPath]: seriesApi.reducer,
  [fileApi.reducerPath]: fileApi.reducer,
  [actionsApi.reducerPath]: actionsApi.reducer,
  [episodeApi.reducerPath]: episodeApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [traktApi.reducerPath]: traktApi.reducer,
  [webuiApi.reducerPath]: webuiApi.reducer,
  [initApi.reducerPath]: initApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [queueApi.reducerPath]: queueApi.reducer,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: createRouterReducer(history), ...reducers }));
