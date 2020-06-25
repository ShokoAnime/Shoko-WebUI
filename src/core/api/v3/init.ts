import Api from '../index';
import type { ApiRequestMethodType } from '../index';
import type { DefaultUserType } from '../../types/api/init';

function ApiRequest(action: string, expectEmpty = true, method: ApiRequestMethodType = 'GET', params?: any) {
  return Api.call({
    action: `/v3/Init/${action}`, method, params, expectEmpty,
  });
}

// Gets various information about the startup status of the server This will work after init
function getStatus() {
  return ApiRequest('status', false);
}

// Gets the Default user's credentials. Will only return on first run
function getDefaultUser() {
  return ApiRequest('defaultuser', false);
}

// Sets the default user's credentials
function postDefaultUser(payload: DefaultUserType) {
  return ApiRequest('defaultuser', true, 'POST', payload);
}

// Starts the server, or does nothing
function getStartServer() {
  return ApiRequest('startserver');
}

// Test AniDB Creditentials
function getAniDBTest() {
  return ApiRequest('anidb/test');
}

// Test Database Connection with Current Settings
function getDatabaseTest() {
  return ApiRequest('database/test');
}

export default {
  getStatus,
  getDefaultUser,
  postDefaultUser,
  getStartServer,
  getAniDBTest,
  getDatabaseTest,
};
