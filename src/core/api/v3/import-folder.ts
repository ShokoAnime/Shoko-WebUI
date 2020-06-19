import Api from '../index';
import type { ApiRequestMethodType } from '../index';
import type { ImportFolderType } from '../../types/api/import-folder';

function ApiRequest(action: string, method: ApiRequestMethodType = 'GET', params?: any, expectEmpty = true) {
  return Api.call({
    action: `/v3/ImportFolder/${action}`, method, expectEmpty, params,
  });
}

// List all Import Folders
function getImportFolder() {
  return ApiRequest('');
}

// Edit Import Folder. This replaces all values.
function putImportFolder(params: ImportFolderType) {
  return ApiRequest('', 'PUT', params);
}

// Add an Import Folder. Does not run import on the folder, so you must scan it yourself.
function postImportFolder(params: ImportFolderType) {
  return ApiRequest('', 'POST', params, false);
}

// Delete an Import Folder. This removes records and send deleted commands to AniDB,
// so don't use it frivolously
function deleteImportFolder(id: string) {
  return ApiRequest(id, 'DELETE');
}

// Scan a Specific Import Folder. This checks ALL files, not just new ones.
// Good for cleaning up files in strange states and making drop folders retry moves
function getImportFolderScan(id: string) {
  return ApiRequest(`${id}/Scan`);
}

export default {
  getImportFolder,
  putImportFolder,
  postImportFolder,
  deleteImportFolder,
  getImportFolderScan,
};
