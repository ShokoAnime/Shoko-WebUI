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
function patchFileWatched(id: string, watched: boolean = true) {
  return ApiRequest(`${id}/Scrobble`, 'PATCH', `?watched=${watched}`);
}

// Mark or unmark the file as ignored
function patchFileIgnore(id: string, ignore: boolean = true) {
  return ApiRequest(`${id}/Ignore`, 'PATCH', `?value=${ignore}`);
}

// Run a file through AVDump
function postFileAvdump(id: string) {
  return ApiRequest(`${id}/AVDump`, 'POST');
}

// Rescan the file.
function postFileRescan(id: string) {
  return ApiRequest(`${id}/Rescan`, 'POST');
}

// Rehash the file.
function postFileRehash(id: string) {
  return ApiRequest(`${id}/Rehash`, 'POST');
}

// Get Recently Added Files
function getFileRecentLegacy(limit = 50) {
  return ApiRequest(`Recent/${limit}`, 'GET');
}

// Get Recently Added Files
function getFileRecent(pageSize = 50, page = 1) {
  return ApiRequest('Recent', 'GET', `?pageSize=${pageSize}&page=${page}`);
}

// Get files with more than one location.
function getFileDuplicates(pageSize = 50, page = 1) {
  return ApiRequest('Duplicates', 'GET', `?pageSize=${pageSize}&page=${page}`);
}

export default {
  getFile,
  getFileAniDB,
  getFileMediaInfo,
  patchFileWatched,
  patchFileIgnore,
  postFileAvdump,
  postFileRescan,
  postFileRehash,
  getFileRecent,
  getFileDuplicates,
  getFileRecentLegacy,
};
