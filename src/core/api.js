import 'isomorphic-fetch';
import store from './store';

function apiCall(apiAction, apiParams) {
  const apiKey = store.getState().apiSession.apikey;

  // eslint-disable-next-line no-undef
  return fetch(`/api${apiAction}${apiParams}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
  })
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject(`Network error: ${apiAction} ${response.status}: ${response.statusText}`);
      }
      return Promise.resolve(response);
    });
}

function jsonApiCall(apiAction, apiParams) {
  return apiCall(apiAction, apiParams)
    .then(response => response.json());
}

function jsonApiResponse(apiAction, apiParams) {
  return jsonApiCall(apiAction, apiParams)
    .then((json) => {
      if (json.code && json.code !== 200) {
        return { error: true, message: json.message || '' };
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
};
