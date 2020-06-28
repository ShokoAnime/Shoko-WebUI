import Api from './index';

function ApiRequest(action: string, expectEmpty = false, endpoint = '/plex' as '/plex' | '/api') {
  return Api.call({ action: `/${action}`, expectEmpty, endpoint });
}

function getPlexLoginUrl() {
  ApiRequest('loginurl');
}

export function getPlexSyncAll() {
  ApiRequest('sync/all', true);
}

export default {
  getPlexLoginUrl,
  getPlexSyncAll,
};
