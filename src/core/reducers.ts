import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { handleAction } from 'redux-actions';
import {
  SET_AUTOUPDATE, UPDATE_AVAILABLE, JMM_VERSION,
} from './actions';
import Version from '../../public/version.json';

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

export function apiReducer(state, action) {
  // return action.error ? state : Object.assign({}, state, action.payload);
  return action.error ? state : Object.assign({}, action.payload);
}

const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);

const jmmVersion = handleAction(JMM_VERSION, (state, action) => (action.error ? state : action.payload), '');

export const updateAvailable = handleAction(UPDATE_AVAILABLE, (state, action: any) => {
  if (action.error) { return state; }
  return Version.debug === false && action.payload.version !== Version.package;
}, false);

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
  updateAvailable,
  jmmVersion,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: connectRouter(history), ...reducers }));
