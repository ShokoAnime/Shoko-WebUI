import Api from '../index';
import type { ApiRequestMethodType } from '../index';

function ApiRequest(action: string, method: ApiRequestMethodType = 'GET', query = '') {
  return Api.call({ action: `/v3/File/${action}`, method, query });
}

// Get File Details
function getFile(id: string) {
  return ApiRequest(id);
}

// Get the AniDB details for episode with Shoko ID
function getFileAniDB(id: string) {
  return ApiRequest(`${id}/AniDB`);
}

// Get the MediaInfo model for file with VideoLocal ID
function getFileMediaInfo(id: string) {
  return ApiRequest(`${id}/MediaInfo`);
}

// Run a file through AVDump
function postFileAvdump(id: string) {
  return ApiRequest(`${id}/avdump`, 'POST');
}

// Get Recently Added Files
function getFileRecent(limit = 50) {
  return ApiRequest(`Recent/${limit}`);
}

// Get Unrecognized Files. Use pageSize and page (index 0) in the query to enable pagination.
function getFileUnrecognized() {
  return ApiRequest('Unrecognized', 'GET', '?pageSize=0');
}

export default {
  getFile,
  getFileAniDB,
  getFileMediaInfo,
  postFileAvdump,
  getFileRecent,
  getFileUnrecognized,
};
