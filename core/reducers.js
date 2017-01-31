import { combineReducers } from 'redux';
import { handleAction, handleActions } from 'redux-actions';
import {
  QUEUE_STATUS,
  SET_AUTOUPDATE,
  STATUS_INVALIDATE,
  STATUS_RECEIVE,
  STATUS_REQUEST,
  RECENT_FILES,
  JMM_NEWS,
  IMPORT_FOLDERS,
  SERIES_COUNT,
  FILES_COUNT,
  SIDEBAR_TOGGLE,
  UPDATE_AVAILABLE,
  WEBUI_VERSION_UPDATE,
  API_SESSION,
  JMM_VERSION,
  IMPORT_FOLDER_SERIES,
  SELECT_IMPORT_FOLDER_SERIES,
  GLOBAL_ALERT,
  LOGOUT,
} from './actions';
import modals from './reducers/modals';
import settings from './reducers/settings';
import logs from './reducers/logs';

const VERSION = __VERSION__; // eslint-disable-line no-undef

export function createApiReducer(type, dataPropName = 'items', dataPropValue = {},
  valueFn = undefined) {
  let valueFunc = null;
  if (valueFn === undefined) {
    valueFunc = value => value;
  } else {
    valueFunc = valueFn;
  }
  return (state = {
    isFetching: false,
    didInvalidate: true,
    [dataPropName]: dataPropValue,
  }, action) => {
    if (action.type !== type) {
      return state;
    }
    switch (action.meta.status) {
      case STATUS_INVALIDATE:
        return Object.assign({}, state, {
          didInvalidate: true,
        });
      case STATUS_REQUEST:
        return Object.assign({}, state, {
          isFetching: true,
          didInvalidate: false,
        });
      case STATUS_RECEIVE:
        return Object.assign({}, state, {
          isFetching: false,
          didInvalidate: false,
          [dataPropName]: valueFunc(action.payload),
          lastUpdated: action.meta.receivedAt,
        });
      default:
        return state;
    }
  };
}

const queueStatus = createApiReducer(QUEUE_STATUS);
const recentFiles = createApiReducer(RECENT_FILES, 'items', []);
const jmmNews = createApiReducer(JMM_NEWS, 'items', []);
const importFolders = createApiReducer(IMPORT_FOLDERS, 'items', []);
const seriesCount = createApiReducer(SERIES_COUNT);
const filesCount = createApiReducer(FILES_COUNT);
const updateAvailable = createApiReducer(UPDATE_AVAILABLE, 'status', false, payload =>
  VERSION.indexOf('.') !== -1 && payload.version !== VERSION,
);
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
  (state, action) => (action.error ? state : action.payload)
, true);
const autoUpdate = handleAction(SET_AUTOUPDATE,
  (state, action) => (action.error ? state : action.payload)
, false);
const selectedImportFolderSeries = handleAction(SELECT_IMPORT_FOLDER_SERIES,
  (state, action) => (action.error ? state : action.payload)
  , {});
const globalAlert = handleAction(GLOBAL_ALERT,
  (state, action) => (action.error ? state : action.payload)
  , []);

const rootReducer = combineReducers({
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
});

export default rootReducer;
