import { combineReducers } from 'redux';
import { createRouterReducer } from '@lagunovsky/redux-react-router';
import { handleAction } from 'redux-actions';
import {
  SET_AUTOUPDATE,
} from './actions';

import apiSessionReducer from './slices/apiSession';
import globalAlertReducer from './slices/globalAlert';
import fetchingReducer from './slices/fetching';
import firstrunReducer from './slices/firstrun';
import localSettingsReducer from './slices/localSettings';
import mainpageReducer from './slices/mainpage';
import miscReducer from './slices/misc';
import modalsReducer from './slices/modals';
import serverSettingsReducer from './slices/serverSettings';
import webuiSettingsReducer from './slices/webuiSettings';
import jmmVersionReducer from './slices/jmmVersion';
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

const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);

const reducers = {
  apiSession: apiSessionReducer,
  globalAlert: globalAlertReducer,
  fetching: fetchingReducer,
  firstrun: firstrunReducer,
  localSettings: localSettingsReducer,
  mainpage: mainpageReducer,
  misc: miscReducer,
  modals: modalsReducer,
  serverSettings: serverSettingsReducer,
  webuiSettings: webuiSettingsReducer,
  autoUpdate,
  jmmVersion: jmmVersionReducer,
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
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: createRouterReducer(history), ...reducers }));
