import Api from '../index';
import type { ApiRequestMethodType } from '../index';
import type { defaultUser } from '../../types/api/init';

function ApiRequest(action: string, method: ApiRequestMethodType = 'GET', params?: any) {
  return Api.call({ action: `/v3/Init/${action}`, method, params });
}

// Gets various information about the startup status of the server This will work after init
function getStatus() {
  return ApiRequest('status');
}

// Gets the Default user's credentials. Will only return on first run
function getDefaultUser() {
  return ApiRequest('defaultuser');
}

// Sets the default user's credentials
function postDefaultUser(payload: defaultUser) {
  return ApiRequest('defaultuser', 'POST', payload);
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
