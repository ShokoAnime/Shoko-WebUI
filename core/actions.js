import 'isomorphic-fetch';
import store from './store';

export const STATUS_INVALIDATE = 'STATUS_INVALIDATE';
export const STATUS_REQUEST = 'STATUS_REQUEST';
export const STATUS_RECEIVE = 'STATUS_RECEIVE';

export const SET_APIKEY = 'SET_APIKEY';

export function setApiKey(apiKey) {
    return {
        type: SET_APIKEY,
        key: apiKey
    }
}

export const SET_AUTOUPDATE = 'SET_AUTOUPDATE';

export function setAutoupdate(status) {
    return {
        type: SET_AUTOUPDATE,
        state: status
    }
}

export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE';

export function toggleSidebar(status) {
    return {
        type: SIDEBAR_TOGGLE,
        state: status
    }
}

export function autoUpdateTick() {
    const state = store.getState();
    store.dispatch(fetchQueues(state.activeApiKey));
}

export const QUEUE_STATUS = 'QUEUE_STATUS';
export function invalidateQueues() {
    return {
        type: QUEUE_STATUS,
        status: STATUS_INVALIDATE
    }
}
export function requestQueues() {
    return {
        type: QUEUE_STATUS,
        status: STATUS_REQUEST
    }
}

export function receiveQueues(json) {
    return {
        type: QUEUE_STATUS,
        status: STATUS_RECEIVE,
        items: json,
        receivedAt: Date.now()
    }
}

export function fetchQueues(apiKey) {
    return function (dispatch) {
        dispatch(requestQueues());

        return fetch('/api/queue/get', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
        .then(response => response.json())
        .then(json =>
            dispatch(receiveQueues(json))
        )
        .catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }
}

function shouldFetchQueues(state) {
    const status = state.queues;
    if (!status) {
        return true
    } else if (status.isFetching) {
        return false
    } else {
        return status.didInvalidate
    }
}

export function fetchQueuesIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchQueues(getState())) {
            return dispatch(fetchQueues())
        } else {
            return Promise.resolve()
        }
    }
}

export const RECENT_FILES = 'RECENT_FILES';

export function invalidateRecentFiles() {
    return {
        type: RECENT_FILES,
        status: STATUS_INVALIDATE
    }
}

export function requestRecentFiles() {
    return {
        type: RECENT_FILES,
        status: STATUS_REQUEST
    }
}

export function receiveRecentFiles(json) {
    return {
        type: RECENT_FILES,
        status: STATUS_RECEIVE,
        items: json,
        receivedAt: Date.now()
    }
}

export function fetchRecentFiles(apiKey) {
    return function (dispatch) {
        dispatch(requestRecentFiles());
        const { autoUpdate } = store.getState();

        return fetch('/api/file/recent', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveRecentFiles(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

export const JMM_NEWS = 'JMM_NEWS';

export function invalidateJmmNews() {
    return {
        type: JMM_NEWS,
        status: STATUS_INVALIDATE
    }
}

export function requestJmmNews() {
    return {
        type: JMM_NEWS,
        status: STATUS_REQUEST
    }
}

export function receiveJmmNews(json) {
    return {
        type: JMM_NEWS,
        status: STATUS_RECEIVE,
        items: json,
        receivedAt: Date.now()
    }
}

export function fetchJmmNews(apiKey) {
    return function (dispatch) {
        dispatch(requestJmmNews());

        return fetch('/api/news/get', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json => dispatch(receiveJmmNews(json)))
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

export const IMPORT_FOLDERS = 'IMPORT_FOLDERS';

export function invalidateImportFolders() {
    return {
        type: IMPORT_FOLDERS,
        status: STATUS_INVALIDATE
    }
}

export function requestImportFolders() {
    return {
        type: IMPORT_FOLDERS,
        status: STATUS_REQUEST
    }
}

export function receiveImportFolders(json) {
    return {
        type: IMPORT_FOLDERS,
        status: STATUS_RECEIVE,
        items: json,
        receivedAt: Date.now()
    }
}

export function fetchImportFolders(apiKey) {
    return function (dispatch) {
        dispatch(requestImportFolders());

        return fetch('/api/folder/list', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveImportFolders(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

export const SERIES_COUNT = 'SERIES_COUNT';

export function invalidateSeriesCount() {
    return {
        type: SERIES_COUNT,
        status: STATUS_INVALIDATE
    }
}

export function requestSeriesCount() {
    return {
        type: SERIES_COUNT,
        status: STATUS_REQUEST
    }
}

export function receiveSeriesCount(json) {
    return {
        type: SERIES_COUNT,
        status: STATUS_RECEIVE,
        count: json.count,
        receivedAt: Date.now()
    }
}

export function fetchSeriesCount(apiKey) {
    return function (dispatch) {
        dispatch(requestSeriesCount());

        return fetch('/api/serie/count', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveSeriesCount(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

export const FILES_COUNT = 'FILES_COUNT';

export function invalidateFilesCount() {
    return {
        type: FILES_COUNT,
        status: STATUS_INVALIDATE
    }
}

export function requestFilesCount() {
    return {
        type: FILES_COUNT,
        status: STATUS_REQUEST
    }
}

export function receiveFilesCount(json) {
    return {
        type: FILES_COUNT,
        status: STATUS_RECEIVE,
        count: json.count,
        receivedAt: Date.now()
    }
}

export function fetchFilesCount(apiKey) {
    return function (dispatch) {
        dispatch(requestFilesCount());

        return fetch('/api/file/count', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveFilesCount(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';

export function requestUpdateAvailable() {
    return {
        type: UPDATE_AVAILABLE,
        status: STATUS_REQUEST
    }
}

export function receiveUpdateAvailable(json) {
    return {
        type: UPDATE_AVAILABLE,
        status: STATUS_RECEIVE,
        count: json.count,
        receivedAt: Date.now()
    }
}

export function fetchUpdateAvailable(apiKey) {
    return function (dispatch) {
        dispatch(requestUpdateAvailable());

        return fetch('/api/webui/latest', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveUpdateAvailable(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}

function shouldFetchUpdateAvailable(state) {
    const status = state.updateAvailable;
    if (!status) {
        return true
    } else if (status.isFetching) {
        return false
    } else if (status.lastUpdated) {
        return false
    } else {
        return status.didInvalidate
    }
}

export function fetchUpdateAvailableIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchUpdateAvailable(getState())) {
            return dispatch(fetchUpdateAvailable(getState().activeApiKey))
        } else {
            return Promise.resolve()
        }
    }
}

export const WEBUI_VERSION_UPDATE = 'WEBUI_VERSION_UPDATE';

export function requestWebuiVersionUpdate() {
    return {
        type: WEBUI_VERSION_UPDATE,
        status: STATUS_REQUEST
    }
}

export function receiveWebuiVersionUpdate(json) {
    return {
        type: WEBUI_VERSION_UPDATE,
        status: STATUS_RECEIVE,
        count: json.count,
        receivedAt: Date.now()
    }
}

export function fetchWebuiVersionUpdate(apiKey) {
    return function (dispatch) {
        dispatch(requestWebuiVersionUpdate());

        return fetch('/api/webui/update', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        })
          .then(response => response.json())
          .then(json =>
            dispatch(receiveWebuiVersionUpdate(json))
          )
          .catch(function (ex) {
              console.log('parsing failed', ex)
          });
    }
}