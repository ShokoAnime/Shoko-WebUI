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
import { createApiReducer, apiReducer } from './util';
import Version from '../../public/version.json';

const VERSION = Version.debug ? Version.git : Version.package;

const webuiVersionUpdate = createApiReducer(WEBUI_VERSION_UPDATE, 'items',
  { status: false, error: false },
);
const jmmVersion = createApiReducer(JMM_VERSION, 'version', '');
const importFolderSeries = createApiReducer(IMPORT_FOLDER_SERIES);

export const apiSession = handleActions({
  [API_SESSION]: (state, action) =>
    (action.error ? state : Object.assign({}, state, action.payload)),
  [LOGOUT]: state => Object.assign({}, state, { apikey: '' }),
}, { apikey: '' });

const sidebarToggle = handleAction(SIDEBAR_TOGGLE,
  (state, action) => (action.error ? state : action.payload), true);
const autoUpdate = handleAction(SET_AUTOUPDATE,
  (state, action) => (action.error ? state : action.payload), false);
const selectedImportFolderSeries = handleAction(SELECT_IMPORT_FOLDER_SERIES,
  (state, action) => (action.error ? state : action.payload)
  , {});
const globalAlert = handleAction(GLOBAL_ALERT,
  (state, action) => (action.error ? state : action.payload)
  , []);
const queueStatus = handleAction(QUEUE_STATUS, apiReducer, {});
const recentFiles = handleAction(RECENT_FILES, apiReducer, {});
const importFolders = handleAction(IMPORT_FOLDERS, apiReducer, {});
const seriesCount = handleAction(SERIES_COUNT, apiReducer, {});
const filesCount = handleAction(FILES_COUNT, apiReducer, {});
const jmmNews = handleAction(JMM_NEWS, apiReducer, {});
const updateAvailable = handleAction(UPDATE_AVAILABLE,
  (state, action) => (action.error ? state : Object.assign({}, state, VERSION.indexOf('.') !== -1 && action.payload.version !== VERSION))
  , {});

const fetching = handleAction(SET_FETCHING, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, action.payload || {});
}, {});

const rootReducer = combineReducers({
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
});

export default rootReducer;
