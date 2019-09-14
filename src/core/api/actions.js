// @flow
import Api from './index';

// Run Import action on all Import Folders
function getFolderImport() {
  return Api.call({ action: '/folder/import', expectEmpty: true });
}
// Scan All Drop Folders
function getFolderScan() {
  return Api.call({ action: '/folder/scan', expectEmpty: true });
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
function getCoreAnidbVotesSync() {
  return Api.call({ action: '/core/anidb/votes/sync', expectEmpty: true });
}
// Sync AniDB list
function getCoreAnidbListSync() {
  return Api.call({ action: '/core/anidb/list/sync', expectEmpty: true });
}
// Update AniDB info
function getCoreAnidbUpdate() {
  return Api.call({ action: '/core/anidb/update', expectEmpty: true });
}
// Update AniDB missing files
function getCoreAnidbUpdatemissingcache() {
  return Api.call({ action: '/core/anidb/updatemissingcache', expectEmpty: true });
}
// Sync Trakt
function getCoreTraktSync() {
  return Api.call({ action: '/core/trakt/sync', expectEmpty: true });
}
// Scan Trakt
function getCoreTraktScan() {
  return Api.call({ action: '/core/trakt/scan', expectEmpty: true });
}
// Update TvDB info
function getCoreTvdbUpdate() {
  return Api.call({ action: '/core/tvdb/update', expectEmpty: true });
}
// Regen TvDB links
function getCoreTvdbRegenlinks() {
  return Api.call({ action: '/core/tvdb/regenlinks', expectEmpty: true });
}
// Check TvDB links
function getCoreTvdbChecklinks() {
  return Api.call({ action: '/core/tvdb/checklinks', expectEmpty: true });
}
// Update MovieDB info
function getCoreMoviedbUpdate() {
  return Api.call({ action: '/core/moviedb/update', expectEmpty: true });
}
// Update images
function getCoreImagesUpdate() {
  return Api.call({ action: '/core/images/update', expectEmpty: true });
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
  getRemoveMissingFiles,
  getStatsUpdate,
  getMediainfoUpdate,
  getHashSync,
  getRescanunlinked,
  getRescanmanuallinks,
  getRehashunlinked,
  getRehashmanuallinks,
  getAvdumpmismatchedfiles,
  getCoreAnidbVotesSync,
  getCoreAnidbListSync,
  getCoreAnidbUpdate,
  getCoreAnidbUpdatemissingcache,
  getCoreTraktSync,
  getCoreTraktScan,
  getCoreTvdbUpdate,
  getCoreTvdbRegenlinks,
  getCoreTvdbChecklinks,
  getCoreMoviedbUpdate,
  getCoreImagesUpdate,
  getImageValidateall,
  getPlexSync,
};
