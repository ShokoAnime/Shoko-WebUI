
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { handleAction, handleActions } from 'redux-actions';
import {
  QUEUE_STATUS, SET_AUTOUPDATE, RECENT_FILES, JMM_NEWS, IMPORT_FOLDERS, DASHBOARD_STATS,
  DASHBOARD_SERIES_SUMMARY, SIDEBAR_TOGGLE, UPDATE_AVAILABLE, API_SESSION, GLOBAL_ALERT,
  SELECT_IMPORT_FOLDER_SERIES, LOGOUT, JMM_VERSION, IMPORT_FOLDER_SERIES, SET_FETCHING,
} from './actions';
// import modals from './reducers/modals';
import settings from './reducers/settings';
import firstrun from './reducers/firstrun';
import Version from '../../public/version.json';

function apiReducer(state, action) {
  return action.error ? state : Object.assign({}, state, action.payload);
}

type apiSessionState = {
  apikey: string;
};

export const apiSession = handleActions({
  [API_SESSION]: (state: apiSessionState, action): apiSessionState =>
    (action.error ? state : Object.assign({}, state, action.payload)),
  [LOGOUT]: (state: apiSessionState): apiSessionState => Object.assign({}, state, { apikey: '' }),
}, { apikey: '' });

export const importFolderSeries = handleAction(
  IMPORT_FOLDER_SERIES,
  (state, action) => action.payload || state, [],
);

const sidebarToggle = handleAction(
  SIDEBAR_TOGGLE,
  (state, action) => (action.error ? state : action.payload),
  true,
);
const autoUpdate = handleAction(SET_AUTOUPDATE, (state, action) => action.payload, false);
const importFolders = handleAction(IMPORT_FOLDERS, (state, action) => action.payload || state, []);
const selectedImportFolderSeries = handleAction(
  SELECT_IMPORT_FOLDER_SERIES,
  (state, action) => (action.error ? state : action.payload),
  {},
);
const globalAlert = handleAction(
  GLOBAL_ALERT,
  (state, action) => (action.error ? state : action.payload),
  [],
);
const jmmVersion = handleAction(JMM_VERSION, (state, action) => (action.error ? state : action.payload), '');
const queueStatus = handleAction(QUEUE_STATUS, apiReducer, {});
const recentFiles = handleAction(RECENT_FILES, (state, action) => action.payload || state, []);
const dashboardStats = handleAction(DASHBOARD_STATS, apiReducer, {});
const dashboardSeriesSummary = handleAction(DASHBOARD_SERIES_SUMMARY, apiReducer, {});
const jmmNews = handleAction(JMM_NEWS, apiReducer, {});
export const updateAvailable = handleAction(UPDATE_AVAILABLE, (state, action: any) => {
  if (action.error) { return state; }
  return Version.debug === false && action.payload.version !== Version.package;
}, false);


const fetching = handleAction(SET_FETCHING, (state, action) => {
  if (action.error) { return state; }
  return Object.assign({}, state, action.payload || {});
}, {});

const reducers = {
  globalAlert,
  apiSession,
  autoUpdate,
  queueStatus,
  recentFiles,
  jmmNews,
  importFolders,
  dashboardStats,
  dashboardSeriesSummary,
  sidebarToggle,
  updateAvailable,
  jmmVersion,
  importFolderSeries,
  selectedImportFolderSeries,
  settings,
  // modals,
  firstrun,
  fetching,
};

export type Reducers = typeof reducers;

export default (history => combineReducers({ router: connectRouter(history), ...reducers }));
