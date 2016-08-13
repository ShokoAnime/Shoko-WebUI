import 'isomorphic-fetch';
import { createAction } from 'redux-actions';
import { forEach } from 'lodash';
import store from './store';

export const STATUS_INVALIDATE = 'STATUS_INVALIDATE';
export const STATUS_REQUEST = 'STATUS_REQUEST';
export const STATUS_RECEIVE = 'STATUS_RECEIVE';

function createAsyncAction(type, key, apiAction, responseCallback) {
  return (forceFetch) => {
    const state = store.getState();
    const status = state[key];
    const apiKey = state.apiSession.apikey;
    let shouldFetch;

    if (!status) {
      shouldFetch = true;
    } else if (status.isFetching) {
      shouldFetch = false;
    } else if (forceFetch === true) {
      shouldFetch = true;
    } else {
      shouldFetch = status.didInvalidate;
    }

    if (shouldFetch) {
      store.dispatch(createAction(type, payload => payload, () => ({ status: STATUS_REQUEST }))());
      // eslint-disable-next-line no-undef
      return fetch(`/api${apiAction}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      })
        .then((response) => {
          if (typeof responseCallback === 'function') {
            return responseCallback(response);
          }
          return response.json();
        })
        .then(json => store.dispatch(createAction(type, payload => payload, () => ({
          status: STATUS_RECEIVE,
          receivedAt: Date.now(),
        }))(json)))
        .catch(() => {
          // TODO: toastr notification
        });
    }
    return Promise.resolve();
  };
}

/* Sync actions */
export const API_SESSION = 'API_SESSION';
export const apiSession = createAction(API_SESSION);
export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
export const toggleSidebar = createAction(SIDEBAR_TOGGLE);

/* Async actions - API calls */
export const QUEUE_STATUS = 'QUEUE_STATUS';
export const queueStatusAsync = createAsyncAction(QUEUE_STATUS, 'queueStatus', '/queue/get');
export const RECENT_FILES = 'RECENT_FILES';
export const recentFilesAsync = createAsyncAction(RECENT_FILES, 'recentFiles', '/file/recent');
export const JMM_NEWS = 'JMM_NEWS';
export const jmmNewsAsync = createAsyncAction(JMM_NEWS, 'jmmNews', '/news/get');
export const IMPORT_FOLDERS = 'IMPORT_FOLDERS';
export const importFoldersAsync =
  createAsyncAction(IMPORT_FOLDERS, 'importFolders', '/folder/list');
export const SERIES_COUNT = 'SERIES_COUNT';
export const seriesCountAsync = createAsyncAction(SERIES_COUNT, 'seriesCount', '/serie/count');
export const FILES_COUNT = 'FILES_COUNT';
export const filesCountAsync = createAsyncAction(FILES_COUNT, 'fileCount', '/file/count');
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const updateAvailableAsync =
  createAsyncAction(UPDATE_AVAILABLE, 'updateAvailable', '/webui/latest');
export const WEBUI_VERSION_UPDATE = 'WEBUI_VERSION_UPDATE';
export const updateWebuiAsync =
  createAsyncAction(WEBUI_VERSION_UPDATE, 'webuiVersionUpdate', '/webui/update', (response) => {
    if (response.status === 200) {
      return true;
    }
    return new Error(`Response status: ${response.status}`);
  });
export const JMM_VERSION = 'JMM_VERSION';
export const jmmVersionAsync =
  createAsyncAction(JMM_VERSION, 'jmmVersion', '/version', (response) => {
    if (response.status !== 200) {
      return new Error(`Response status: ${response.status}`);
    }
    return response.json().then((json) => {
      try {
        let version = null;
        forEach(json, (value, key) => {
          if (value.name === 'jmmserver') {
            version = value.version;
          }
        });
        return version === null ? Error('Not found!') : version;
      } catch (ex) {
        return new Error(ex.message);
      }
    });
  });


/* Timer */
function autoUpdateTick() {
  queueStatusAsync(true);
  recentFilesAsync(true);
}
let autoupdateTimer = null;
export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';
export function setAutoupdate(status) {
  if (autoupdateTimer !== null) {
    clearInterval(autoupdateTimer);
    autoupdateTimer = null;
  }
  if (status === true) {
    autoupdateTimer = setInterval(autoUpdateTick, 4000);
  }
  return createAction(SET_AUTOUPDATE)(status);
}

