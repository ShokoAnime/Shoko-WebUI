import 'isomorphic-fetch';
import store from './store';
import { createAction } from 'redux-actions';

export const STATUS_INVALIDATE = 'STATUS_INVALIDATE';
export const STATUS_REQUEST = 'STATUS_REQUEST';
export const STATUS_RECEIVE = 'STATUS_RECEIVE';

function createAsyncAction(type, key, apiAction) {
    return () => {
        const state = store.getState();
        const status = state[key];
        const apiKey = state.activeApiKey;
        let shouldFetch;

        if (!status) {
            shouldFetch = true;
        } else if (status.isFetching) {
            shouldFetch = false;
        } else {
            shouldFetch = status.didInvalidate;
        }

        if (shouldFetch) {
            store.dispatch(createAction(type, payload => payload, ()=>({status: STATUS_REQUEST}))());

            return fetch('/api' + apiAction, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'apikey': apiKey
                }
            })
              .then(response => response.json())
              .then(json =>
                store.dispatch(createAction(type, payload => payload, ()=>({status: STATUS_RECEIVE, receivedAt: Date.now()}))(json))
              )
              .catch(function (ex) {
                  console.log('parsing failed', ex)
              });

        } else {
            return Promise.resolve()
        }
    }
}

/* Sync actions */
export const API_SESSION = 'API_SESSION';
export const apiSession = createAction(API_SESSION);
export const SET_APIKEY = 'SET_APIKEY';
export const setApiKey = createAction(SET_APIKEY);
export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';
export const toggleSidebar = createAction(SIDEBAR_TOGGLE);

/* Async actions - API calls */
export const QUEUE_STATUS = 'QUEUE_STATUS';
export const queueStatusAsync = createAsyncAction(QUEUE_STATUS,'queueStatus','/queue/get');
export const RECENT_FILES = 'RECENT_FILES';
export const recentFilesAsync = createAsyncAction(RECENT_FILES,'recentFiles','/file/recent');
export const JMM_NEWS = 'JMM_NEWS';
export const jmmNewsAsync = createAsyncAction(JMM_NEWS,'jmmNews','/news/get');
export const IMPORT_FOLDERS = 'IMPORT_FOLDERS';
export const importFoldersAsync = createAsyncAction(IMPORT_FOLDERS,'importFolders','/folder/list');
export const SERIES_COUNT = 'SERIES_COUNT';
export const seriesCountAsync = createAsyncAction(SERIES_COUNT,'seriesCount','/serie/count');
export const FILES_COUNT = 'FILES_COUNT';
export const filesCountAsync = createAsyncAction(FILES_COUNT,'fileCount','/file/count');
export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const updateAvailableAsync = createAsyncAction(UPDATE_AVAILABLE,'updateAvailable','/webui/latest');
export const WEBUI_VERSION_UPDATE = 'WEBUI_VERSION_UPDATE';
export const updateWebuiAsync = createAsyncAction(WEBUI_VERSION_UPDATE,'webuiVersionUpdate','/webui/update');

/* Timer */
export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';
export function setAutoupdate(status) {
    return {
        type: SET_AUTOUPDATE,
        state: status
    }
}

export function autoUpdateTick() {
    queueStatusAsync();
}