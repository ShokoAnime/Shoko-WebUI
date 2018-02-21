import objPath from 'object-path';
import { createAction } from 'redux-actions';
import {
  IMPORT_FOLDER_SERIES,
  SET_AUTOUPDATE,
  setGlobalAlert,
  STATUS_RECEIVE,
  STATUS_REQUEST,
  WEBUI_VERSION_UPDATE,
} from './actions';
import store from './store';
import history from './history';
import Events from './events';
import { getDelta } from './actions/logs/Delta';

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
            store.dispatch(setGlobalAlert(`Network error: ${type} ${response.status}: ${response.statusText}`));
            return Promise.reject();
          }
          return response.json();
        })
        .then((json) => {
          if (json.code && json.code !== 200) {
            store.dispatch(setGlobalAlert(`API error: ${type} ${json.code}: ${json.message}`));
            return Promise.reject();
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

export const updateWebuiAsync = createAsyncAction(
  WEBUI_VERSION_UPDATE,
  'webuiVersionUpdate', '/webui/update/', (response) => {
    if (response.status === 200) {
      return { status: true, error: false };
    }
    return { status: true, error: new Error(`Response status: ${response.status}`) };
  },
);

export const importFolderSeriesAsync = createAsyncAction(
  IMPORT_FOLDER_SERIES,
  'importFolderSeries', '/serie/infobyfolder',
);

function autoUpdateTick() {
  const location = history.location.pathname;

  if (location === '/dashboard') {
    store.dispatch({ type: Events.DASHBOARD_QUEUE_STATUS });
    store.dispatch({ type: Events.DASHBOARD_RECENT_FILES });
  } else if (location === '/logs') {
    const state = store.getState();
    const delta = state.settings.other.logDelta;
    let position = 0;
    try {
      // eslint-disable-next-line prefer-destructuring
      position = state.logs.contents.position;
    } catch (ex) {
      console.error('Unable to get log position');
    }
    store.dispatch(getDelta({ delta, position }));
  }
}

let autoupdateTimer = null;

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
