import Api from '../index';

function ApiRequest(action: string, query = '') {
  return Api.call({ action: `/v3/Folder/${action}`, query });
}

function getFolderDrives() {
  return ApiRequest('drives');
}

function getFolder(path: string) {
  return ApiRequest('', `?path=${path}`);
}

export default {
  getFolderDrives,
  getFolder,
};
