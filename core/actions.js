import 'isomorphic-fetch';
import { createAction } from 'redux-actions';
import { forEach } from 'lodash';
import objPath from 'object-path';
import store from './store';
import history from './history';
import { getDeltaAsync } from './actions/logs/Delta';
import { appendContents } from './actions/logs/Contents';

export const STATUS_INVALIDATE = 'STATUS_INVALIDATE';
export const STATUS_REQUEST = 'STATUS_REQUEST';
export const STATUS_RECEIVE = 'STATUS_RECEIVE';

/* Sync actions */
export const API_SESSION = 'API_SESSION';
export const apiSession = createAction(API_SESSION);
export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
export const toggleSidebar = createAction(SIDEBAR_TOGGLE);
export const SELECT_IMPORT_FOLDER_SERIES = 'SELECT_IMPORT_FOLDER_SERIES';
export const selectImportFolderSeries = createAction(SELECT_IMPORT_FOLDER_SERIES);
export const GLOBAL_ALERT = 'GLOBAL_ALERT';
export const setGlobalAlert = createAction(GLOBAL_ALERT);

export function createAsyncAction(type, key, apiAction, responseCallback) {
  return (forceFetch, apiParams = '') => {
    const state = store.getState();
    const status = objPath.get(state, key);
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
      return fetch(`/api${apiAction}${apiParams}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
      })
        .then((response) => {
          if (typeof responseCallback === 'function') {
            return responseCallback(response);
          } else if (response.status !== 200) {
            store.dispatch(setGlobalAlert(`${response.status}: ${response.statusText}`));
            return Promise.reject();
          }
          return response.json();
        })
        .then((json) => {
          if (json.code && json.code !== 200) {
            store.dispatch(setGlobalAlert(`API error: ${type} ${json.code}: ${json.message}`));
          }
          return json;
        })
        .then(json => store.dispatch(createAction(type, payload => payload, () => ({
          status: STATUS_RECEIVE,
          receivedAt: Date.now(),
        }))(json)))
        .catch(() => {
          // store.dispatch(setGlobalAlert('Unknown error'));
        });
    }
    return Promise.resolve();
  };
}

export function createAsyncPostAction(type, key, apiAction, responseCallback) {
  return (apiParams) => {
    const state = store.getState();
    const apiKey = state.apiSession.apikey;

    store.dispatch(createAction(type, payload => payload, () => ({ status: STATUS_REQUEST }))());
    // eslint-disable-next-line no-undef
    return fetch(`/api${apiAction}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(apiParams),
      method: 'POST',
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
  };
}

export function createAsyncStatelessGetAction(apiAction, responseCallback) {
  return (apiParams = '') => {
    const state = store.getState();
    const apiKey = state.apiSession.apikey;
    // eslint-disable-next-line no-undef
    return fetch(`/api${apiAction}${apiParams}`, {
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
      return Promise.reject();
    });
  };
}

export function createAsyncStatelessPostAction(apiAction, responseCallback) {
  return (apiParams = '') => {
    const state = store.getState();
    const apiKey = state.apiSession.apikey;
    // eslint-disable-next-line no-undef
    return fetch(`/api${apiAction}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(apiParams),
      method: 'POST',
    })
      .then((response) => {
        if (typeof responseCallback === 'function') {
          return responseCallback(response);
        }
        return Promise.reject();
      });
  };
}


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
export const updateAvailableAsync = createAsyncAction(UPDATE_AVAILABLE, 'updateAvailable',
    '/webui/latest/');
export const WEBUI_VERSION_UPDATE = 'WEBUI_VERSION_UPDATE';
export const updateWebuiAsync = createAsyncAction(WEBUI_VERSION_UPDATE,
  'webuiVersionUpdate', '/webui/update/', (response) => {
    if (response.status === 200) {
      return { status: true, error: false };
    }
    return { status: true, error: new Error(`Response status: ${response.status}`) };
  });
export const updateWebui = createAction(WEBUI_VERSION_UPDATE, payload => ({ items: payload }));
export const JMM_VERSION = 'JMM_VERSION';
export const jmmVersionAsync =
  createAsyncAction(JMM_VERSION, 'jmmVersion', '/version', (response) => {
    if (response.status !== 200) {
      return new Error(`Response status: ${response.status}`);
    }
    return response.json().then((json) => {
      try {
        let version = null;
        forEach(json, (value) => {
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

export const IMPORT_FOLDER_SERIES = 'IMPORT_FOLDER_SERIES';
export const importFolderSeriesAsync = createAsyncAction(IMPORT_FOLDER_SERIES,
  'importFolderSeries', '/serie/byfolder');

/* Timer */
function autoUpdateTick() {
  const location = history.location.pathname;

  if (location === '/dashboard') {
    queueStatusAsync(true);
    recentFilesAsync(true);
  } else if (location === '/logs') {
    const state = store.getState();
    const lines = state.settings.other.logDelta;
    let position = 0;
    try {
      position = state.logs.delta.items.position;
    } catch (ex) { console.error('Unable to get log position'); }
    getDeltaAsync(true, `${lines}/${position}`).then(() => {
      const newState = store.getState();
      store.dispatch(appendContents(newState.logs.delta.items.lines));
    });
  }
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
