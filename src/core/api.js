// @flow
import 'isomorphic-fetch';
import Promise from 'es6-promise';
import store from './store';
import Events from './events';

import type { SettingType } from './sagas/settings';

export type ApiResponseSuccessType = { data: any }
export type ApiResponseErrorType = { error: boolean, code?: number, message: string }
export type ApiResponseType = ApiResponseSuccessType | ApiResponseErrorType

function apiCallPost(apiAction, apiParams: string, apiKey) {
  return fetch(`/api${apiAction}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: apiParams,
    method: 'POST',
  });
}

function apiCallGet(apiAction, apiParams: string, apiKey) {
  return fetch(`/api${apiAction}${apiParams}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
  });
}

function apiCall(apiAction, apiParams: {} | string, type = 'GET') {
  const apiKey = store.getState().apiSession.apikey;
  const params = ((type === 'POST' ? JSON.stringify(apiParams) : apiParams: any): string);

  const fetch = type === 'POST' ? apiCallPost(apiAction, params, apiKey) : apiCallGet(apiAction, params, apiKey);

  return fetch.then((response) => {
    if (response.status !== 200) {
      if (response.status === 401) {
        // FIXME: make a better fix
        store.dispatch({ type: Events.LOGOUT, payload: null });
        store.dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'auto-refresh' } });
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
    .then((json): ApiResponseType => {
      if (json.code) {
        if (json.code !== 200) {
          return { error: true, code: json.code, message: json.message || 'No error message given.' };
        }
      }
      return { data: json };
    })
    .catch((reason): ApiResponseErrorType => ({ error: true, message: typeof reason === 'string' ? reason : reason.message }));
}

function getLogDelta(data: {delta: number, position: number}) {
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

function webuiLatest(channel: 'stable' | 'unstable') {
  return jsonApiResponse('/webui/latest/', channel);
}

function configExport() {
  return jsonApiResponse('/config/export', '');
}

function configImport(value: string) {
  return jsonApiResponse('/config/import', value, 'POST');
}

function getLogRotate() {
  return jsonApiResponse('/log/rotate', '');
}

function postLogRotate(data: string) {
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

function postFolderAdd(data: string) {
  return jsonApiResponse('/folder/add', data, 'POST');
}

function postFolderEdit(data: string) {
  return jsonApiResponse('/folder/edit', data, 'POST');
}

function postWebuiConfig(data: string) {
  return jsonApiResponse('/webui/config', data, 'POST');
}

function getPlexSync() {
  return jsonPlexResponse('/plex/sync/all', '');
}

function getPlexLoginurl() {
  return jsonPlexResponse('/plex/loginurl', '');
}

function getInit(data: string) {
  return jsonApiResponse('/init/', data);
}

function getInitDatabase() {
  return jsonApiResponse('/init/database', '');
}

function postInitDatabase(data: string) {
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

function postInitAnidb(data: string) {
  return jsonApiResponse('/init/anidb', data, 'POST');
}

function getInitAnidbTest() {
  return jsonApiResponse('/init/anidb/test', '');
}

function getInitDefaultuser() {
  return jsonApiResponse('/init/defaultuser', '');
}

function postInitDefaultuser(data: string) {
  return jsonApiResponse('/init/defaultuser', data, 'POST');
}

function getInitDatabaseSqlserverinstance() {
  return jsonApiResponse('/init/database/sqlserverinstance', '');
}

function getVersion() {
  return jsonApiResponse('/version', '');
}

function getWebuiUpdate(channel: string) {
  return jsonApiResponse('/webui/update/', channel);
}

function getSerieInfobyfolder(data: string) {
  return jsonApiResponse('/serie/infobyfolder', data);
}

function getOsDrives() {
  return jsonApiResponse('/os/drives', '');
}

function postOsFolder(data: { full_path: string }) {
  return jsonApiResponse('/os/folder', data, 'POST');
}

function postConfigSet(data: Array<SettingType>) {
  return jsonApiResponse('/config/set', data, 'POST');
}

function getTraktCode() {
  return jsonApiResponse('/trakt/code', '');
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
  getPlexLoginurl,
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
  getVersion,
  getWebuiUpdate,
  getSerieInfobyfolder,
  getOsDrives,
  postOsFolder,
  postConfigSet,
  getTraktCode,
};
