import 'isomorphic-fetch';
import store from './store';

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
      return Promise.reject(`Network error: ${apiAction} ${response.status}: ${response.statusText}`);
    }
    return Promise.resolve(response);
  });
}

function jsonApiCall(apiAction, apiParams, type) {
  return apiCall(apiAction, apiParams, type)
    .then(response => response.json());
}

function jsonApiResponse(apiAction, apiParams, type) {
  return jsonApiCall(apiAction, apiParams, type)
    .then((json) => {
      if (json.code && json.code !== 200) {
        return { error: true, message: json.Message || json.message || 'No error message given.' };
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

function getSettings() {
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

export default {
  getLogDelta,
  getSettings,
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
};
