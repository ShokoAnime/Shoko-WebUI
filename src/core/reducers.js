// @flow
import { combineReducers } from 'redux';
import { handleAction, handleActions } from 'redux-actions';
import { routerReducer } from 'react-router-redux';
import {
  QUEUE_STATUS,
  SET_AUTOUPDATE,
  RECENT_FILES,
  JMM_NEWS,
  IMPORT_FOLDERS,
  SERIES_COUNT,
  FILES_COUNT,
  SIDEBAR_TOGGLE,
  UPDATE_AVAILABLE,
  API_SESSION,
  SELECT_IMPORT_FOLDER_SERIES,
  GLOBAL_ALERT,
  LOGOUT,
  WEBUI_VERSION_UPDATE,
  JMM_VERSION,
  IMPORT_FOLDER_SERIES,
  SET_FETCHING,
} from './actions';
import modals from './reducers/modals';
import settings from './reducers/settings';
import logs from './reducers/logs';
import firstrun from './reducers/firstrun';
import Version from '../../public/version.json';

function apiReducer(state, action) {
  return action.error ? state : Object.assign({}, state, action.payload);
}

type apiSessionState = {
  apikey: string
}

export const apiSession = handleActions({
  [API_SESSION]: (state: apiSessionState, action): apiSessionState =>
    (action.error ? state : Object.assign({}, state, action.payload)),
  [LOGOUT]: (state: apiSessionState): apiSessionState => Object.assign({}, state, { apikey: '' }),
}, { apikey: '' });

export const webuiVersionUpdate = handleAction(
  WEBUI_VERSION_UPDATE,
  (state, action) => Object.assign({}, action.payload || state),
  { status: false },
);

export const importFolderSeries = handleAction(
  IMPORT_FOLDER_SERIES,
  (state, action) => action.payload || state,
  [],
);

const sidebarToggle = handleAction(
  SIDEBAR_TOGGLE,
  (state, action) => (action.error ? state : action.payload), true,
);
const autoUpdate = handleAction(
  SET_AUTOUPDATE,
  (state, action) => action.payload, false,
);
const selectedImportFolderSeries = handleAction(
  SELECT_IMPORT_FOLDER_SERIES,
  (state, action) => (action.error ? state : action.payload), {},
);
const globalAlert = handleAction(
  GLOBAL_ALERT,
  (state, action) => (action.error ? state : action.payload), [],
);
const jmmVersion = handleAction(
  JMM_VERSION,
  (state, action) => (action.error ? state : action.payload),
  '',
);
const queueStatus = handleAction(QUEUE_STATUS, apiReducer, {});
const recentFiles = handleAction(RECENT_FILES, apiReducer, {});
const importFolders = handleAction(IMPORT_FOLDERS, apiReducer, {});
const seriesCount = handleAction(SERIES_COUNT, apiReducer, {});
const filesCount = handleAction(FILES_COUNT, apiReducer, {});
const jmmNews = handleAction(JMM_NEWS, apiReducer, {});
export const updateAvailable = handleAction(UPDATE_AVAILABLE, (state, action) => {
  if (action.error) { return state; }
  return Version.debug === false && action.payload.version !== Version.package;
}, false);


const fetching = handleAction(SET_FETCHING, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, action.payload || {});
}, {});

const reducers = {
  router: routerReducer,
  globalAlert,
  apiSession,
  autoUpdate,
  queueStatus,
  recentFiles,
  jmmNews,
  importFolders,
  seriesCount,
  filesCount,
  sidebarToggle,
  updateAvailable,
  webuiVersionUpdate,
  jmmVersion,
  importFolderSeries,
  selectedImportFolderSeries,
  settings,
  modals,
  logs,
  firstrun,
  fetching,
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
