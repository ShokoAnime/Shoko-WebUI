
import Api from './index';

// Run Import action on all Import Folders
function getFolderImport() {
  return Api.call({ action: '/folder/import', expectEmpty: true });
}
// Scan All Drop Folders
function getFolderScan() {
  return Api.call({ action: '/folder/scan', expectEmpty: true });
}
// Scans single folder with the provided ID
function getImportFolderScan(id: string) {
  return Api.call({ action: `/v3/ImportFolder/${id}/Scan`, expectEmpty: true });
}
// Scans your import folders and remove files from your database
// that are no longer in your collection.
function getRemoveMissingFiles() {
  return Api.call({ action: '/remove_missing_files', expectEmpty: true });
}
// Updates all series stats such as watched state and missing files.
function getStatsUpdate() {
  return Api.call({ action: '/stats_update', expectEmpty: true });
}
// Updates all technical details about the files in your collection via running MediaInfo on them.
function getMediainfoUpdate() {
  return Api.call({ action: '/mediainfo_update', expectEmpty: true });
}
// Sync Hashes - download/upload hashes from/to webcache
function getHashSync() {
  return Api.call({ action: '/hash/sync', expectEmpty: true });
}
// Files which have been hashed, but don't have an associated episode
function getRescanunlinked() {
  return Api.call({ action: '/rescanunlinked', expectEmpty: true });
}
// Files which have been hashed, but don't have an associated episode
function getRescanmanuallinks() {
  return Api.call({ action: '/rescanmanuallinks', expectEmpty: true });
}
// Files which have been hashed, but don't have an associated episode
function getRehashunlinked() {
  return Api.call({ action: '/rehashunlinked', expectEmpty: true });
}
// Files which have been hashed, but don't have an associated episode
function getRehashmanuallinks() {
  return Api.call({ action: '/rehashmanuallinks', expectEmpty: true });
}
// Files which have been hashed, but don't have an associated episode
function getAvdumpmismatchedfiles() {
  return Api.call({ action: '/avdumpmismatchedfiles', expectEmpty: true });
}
// Sync AniDB votes
function getAnidbVotesSync() {
  return Api.call({ action: '/anidb/votes/sync', expectEmpty: true });
}
// Sync AniDB list
function getAnidbListSync() {
  return Api.call({ action: '/anidb/list/sync', expectEmpty: true });
}
// Update AniDB info
function getAnidbUpdate() {
  return Api.call({ action: '/anidb/update', expectEmpty: true });
}
// Update AniDB missing files
function getAnidbUpdatemissingcache() {
  return Api.call({ action: '/anidb/updatemissingcache', expectEmpty: true });
}
// Sync Trakt
function getTraktSync() {
  return Api.call({ action: '/trakt/sync', expectEmpty: true });
}
// Scan Trakt
function getTraktScan() {
  return Api.call({ action: '/trakt/scan', expectEmpty: true });
}
// Update TvDB info
function getTvdbUpdate() {
  return Api.call({ action: '/tvdb/update', expectEmpty: true });
}
// Regen TvDB links
function getTvdbRegenlinks() {
  return Api.call({ action: '/tvdb/regenlinks', expectEmpty: true });
}
// Check TvDB links
function getTvdbChecklinks() {
  return Api.call({ action: '/tvdb/checklinks', expectEmpty: true });
}
// Update MovieDB info
function getMoviedbUpdate() {
  return Api.call({ action: '/moviedb/update', expectEmpty: true });
}
// Update images
function getImagesUpdate() {
  return Api.call({ action: '/images/update', expectEmpty: true });
}
// Validate images
function getImageValidateall() {
  return Api.call({ action: '/image/validateall', expectEmpty: true });
}
function getPlexSync() {
  return Api.call({ action: '/sync/all', endpoint: '/plex', expectEmpty: true });
}

export default {
  getFolderImport,
  getFolderScan,
  getImportFolderScan,
  getRemoveMissingFiles,
  getStatsUpdate,
  getMediainfoUpdate,
  getHashSync,
  getRescanunlinked,
  getRescanmanuallinks,
  getRehashunlinked,
  getRehashmanuallinks,
  getAvdumpmismatchedfiles,
  getAnidbVotesSync,
  getAnidbListSync,
  getAnidbUpdate,
  getAnidbUpdatemissingcache,
  getTraktSync,
  getTraktScan,
  getTvdbUpdate,
  getTvdbRegenlinks,
  getTvdbChecklinks,
  getMoviedbUpdate,
  getImagesUpdate,
  getImageValidateall,
  getPlexSync,
};
