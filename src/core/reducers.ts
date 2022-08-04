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
import tempStateReducer from './slices/tempState';

import { dashboardApi } from './rtkQuery/dashboardApi';
import { externalApi } from './rtkQuery/externalApi';
import { collectionApi } from './rtkQuery/collectionApi';

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
  tempState: tempStateReducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [externalApi.reducerPath]: externalApi.reducer,
  [collectionApi.reducerPath]: collectionApi.reducer,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: createRouterReducer(history), ...reducers }));
