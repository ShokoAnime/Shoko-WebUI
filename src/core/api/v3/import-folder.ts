import Api from '../index';
import type { ApiRequestMethodType } from '../index';

function ApiRequest(action: string, method: ApiRequestMethodType = 'GET', params?: any, expectEmpty = true) {
  return Api.call({
    action: `/v3/ImportFolder/${action}`, method, expectEmpty, params,
  });
}

// List all Import Folders
function getImportFolder() {
  return ApiRequest('', undefined, undefined, false);
}

// Scan a Specific Import Folder. This checks ALL files, not just new ones.
// Good for cleaning up files in strange states and making drop folders retry moves
function getImportFolderScan(id: string) {
  return ApiRequest(`${id}/Scan`);
}

export default {
  getImportFolder,
  getImportFolderScan,
};
