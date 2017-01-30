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

export default {
  getLogDelta,
};
