import 'isomorphic-fetch';
import store from './store';
import Events from './events';
import { setAutoupdate } from './legacy-actions';

function apiCallPost(apiAction, apiParams, apiKey) {
  return fetch(`/api${apiAction}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify(apiParams),
    method: 'POST',
  });
}

function apiCallGet(apiAction, apiParams, apiKey) {
  return fetch(`/api${apiAction}${apiParams}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
  });
}

function apiCall(apiAction, apiParams, type = 'GET') {
  const apiKey = store.getState().apiSession.apikey;
  const fetch = type === 'POST' ? apiCallPost(apiAction, apiParams, apiKey) : apiCallGet(apiAction, apiParams, apiKey);

  return fetch.then((response) => {
    if (response.status !== 200) {
      if (response.status === 401) {
        // FIXME: make a better fix
        store.dispatch({ type: Events.LOGOUT });
        setAutoupdate(false);
      }
      return Promise.reject(`Network error: ${apiAction} ${response.status}: ${response.statusText}`);
    }
    return Promise.resolve(response);
  });
}

function plexCall(apiAction, apiParams) {
  const apiKey = store.getState().apiSession.apikey;
  const promise = fetch(`${apiAction}${apiParams}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
  });

  return promise.then((response) => {
    if (response.status !== 200) {
      return Promise.reject(`Network error: ${apiAction} ${response.status}: ${response.statusText}`);
    }
    return Promise.resolve(response);
  });
}

function jsonPlexResponse(apiAction, apiParams) {
  return plexCall(apiAction, apiParams)
    .then(response => response.json())
    .then((json) => {
      if (json.code && json.code !== 200) {
        return { error: true, code: json.code, message: json.message || 'No error message given.' };
      }
      return { data: json };
    })
    .catch(reason => ({ error: true, message: typeof reason === 'string' ? reason : reason.message }));
}

function jsonApiCall(apiAction, apiParams, type) {
  return apiCall(apiAction, apiParams, type)
    .then(response => response.json());
}

function jsonApiResponse(apiAction, apiParams, type) {
  return jsonApiCall(apiAction, apiParams, type)
    .then((json) => {
      if (json.code) {
        if (json.code !== 200) {
          return { error: true, code: json.code, message: json.message || 'No error message given.' };
        }
      }
      return { data: json };
    })
    .catch(reason => ({ error: true, message: typeof reason === 'string' ? reason : reason.message }));
}

function getLogDelta(data) {
  const paramString = data ? `${data.delta}/${data.position}` : '';
  return jsonApiCall('/log/get/', paramString)
    .then((json) => {
      if (json.code && json.code !== 200) {
        if (json.code === 404) {
          return { data: [] };
        }
        return { error: true, message: json.message || '' };
      }
      return { data: json };
    })
    .catch(reason => ({ error: true, message: typeof reason === 'string' ? reason : reason.message }));
}

function getWebuiConfig() {
  return jsonApiResponse('/webui/config', '');
}

function queueStatus() {
  return jsonApiResponse('/queue/get', '');
}

function fileRecent() {
  return jsonApiResponse('/file/recent', '');
}

function folderList() {
  return jsonApiResponse('/folder/list', '');
}

function serieCount() {
  return jsonApiResponse('/serie/count', '');
}

function fileCount() {
  return jsonApiResponse('/file/count', '');
}

function newsGet() {
  return jsonApiResponse('/news/get', '');
}

function webuiLatest(channel) {
  return jsonApiResponse('/webui/latest/', channel);
}

function configExport() {
  return jsonApiResponse('/config/export', '');
}

function configImport(value) {
  return jsonApiResponse('/config/import', value, 'POST');
}

function getLogRotate() {
  return jsonApiResponse('/log/rotate', '');
}

function postLogRotate(data) {
  return jsonApiResponse('/log/rotate', data, 'POST');
}

function getRescan() {
  return jsonApiResponse('/rescan', '');
}

function getRemoveMissingFiles() {
  return jsonApiResponse('/remove_missing_files', '');
}

function getStatsUpdate() {
  return jsonApiResponse('/stats_update', '');
}

function getMediainfoUpdate() {
  return jsonApiResponse('/mediainfo_update', '');
}

function getFolderList() {
  return jsonApiResponse('/folder/list', '');
}

function getFolderImport() {
  return jsonApiResponse('/folder/import', '');
}

function postFolderAdd(data) {
  return jsonApiResponse('/folder/add', data, 'POST');
}

function postFolderEdit(data) {
  return jsonApiResponse('/folder/edit', data, 'POST');
}

function postWebuiConfig(data) {
  return jsonApiResponse('/webui/config', data, 'POST');
}

function getPlexSync() {
  return jsonPlexResponse('/plex/sync/all', '');
}

function getInit(data) {
  return jsonApiResponse('/init/', data);
}

function getInitDatabase() {
  return jsonApiResponse('/init/database', '');
}

function postInitDatabase(data) {
  return jsonApiResponse('/init/database', data, 'POST');
}

function getInitDatabaseTest() {
  return jsonApiResponse('/init/database/test', '');
}

function getInitStartserver() {
  return jsonApiResponse('/init/startserver', '');
}

function getInitAnidb() {
  return jsonApiResponse('/init/anidb', '');
}

function postInitAnidb(data) {
  return jsonApiResponse('/init/anidb', data, 'POST');
}

function getInitAnidbTest() {
  return jsonApiResponse('/init/anidb/test', '');
}

function getInitDefaultuser() {
  return jsonApiResponse('/init/defaultuser', '');
}

function postInitDefaultuser(data) {
  return jsonApiResponse('/init/defaultuser', data, 'POST');
}

function getInitDatabaseSqlserverinstance() {
  return jsonApiResponse('/init/database/sqlserverinstance', '');
}

export default {
  getLogDelta,
  getWebuiConfig,
  queueStatus,
  fileRecent,
  folderList,
  serieCount,
  fileCount,
  newsGet,
  webuiLatest,
  configExport,
  configImport,
  getLogRotate,
  postLogRotate,
  getRescan,
  getRemoveMissingFiles,
  getStatsUpdate,
  getMediainfoUpdate,
  getFolderList,
  postFolderAdd,
  postFolderEdit,
  postWebuiConfig,
  getFolderImport,
  getPlexSync,
  getInit,
  getInitDatabase,
  postInitDatabase,
  getInitDatabaseTest,
  getInitStartserver,
  getInitAnidb,
  postInitAnidb,
  getInitAnidbTest,
  getInitDefaultuser,
  postInitDefaultuser,
  getInitDatabaseSqlserverinstance,
};
