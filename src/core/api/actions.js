// @flow
import Api from './index';

// Run Import action on all Import Folders
function getFolderImport() {
  return Api.call({ action: '/folder/import' });
}
// Scan All Drop Folders
function getFolderScan() {
  return Api.call({ action: '/folder/scan' });
}
// Scans your import folders and remove files from your database
// that are no longer in your collection.
function getRemoveMissingFiles() {
  return Api.call({ action: '/remove_missing_files' });
}
// Updates all series stats such as watched state and missing files.
function getStatsUpdate() {
  return Api.call({ action: '/stats_update' });
}
// Updates all technical details about the files in your collection via running MediaInfo on them.
function getMediainfoUpdate() {
  return Api.call({ action: '/mediainfo_update' });
}
// Sync Hashes - download/upload hashes from/to webcache
function getHashSync() {
  return Api.call({ action: '/hash/sync' });
}
// Files which have been hashed, but don't have an associated episode
function getRescanunlinked() {
  return Api.call({ action: '/rescanunlinked' });
}
// Files which have been hashed, but don't have an associated episode
function getRescanmanuallinks() {
  return Api.call({ action: '/rescanmanuallinks' });
}
// Files which have been hashed, but don't have an associated episode
function getRehashunlinked() {
  return Api.call({ action: '/rehashunlinked' });
}
// Files which have been hashed, but don't have an associated episode
function getRehashmanuallinks() {
  return Api.call({ action: '/rehashmanuallinks' });
}
// Files which have been hashed, but don't have an associated episode
function getAvdumpmismatchedfiles() {
  return Api.call({ action: '/avdumpmismatchedfiles' });
}
// Sync AniDB votes
function getCoreAnidbVotesSync() {
  return Api.call({ action: '/core/anidb/votes/sync' });
}
// Sync AniDB list
function getCoreAnidbListSync() {
  return Api.call({ action: '/core/anidb/list/sync' });
}
// Update AniDB info
function getCoreAnidbUpdate() {
  return Api.call({ action: '/core/anidb/update' });
}
// Update AniDB missing files
function getCoreAnidbUpdatemissingcache() {
  return Api.call({ action: '/core/anidb/updatemissingcache' });
}
// Sync Trakt
function getCoreTraktSync() {
  return Api.call({ action: '/core/trakt/sync' });
}
// Scan Trakt
function getCoreTraktScan() {
  return Api.call({ action: '/core/trakt/scan' });
}
// Update TvDB info
function getCoreTvdbUpdate() {
  return Api.call({ action: '/core/tvdb/update' });
}
// Regen TvDB links
function getCoreTvdbRegenlinks() {
  return Api.call({ action: '/core/tvdb/regenlinks' });
}
// Check TvDB links
function getCoreTvdbChecklinks() {
  return Api.call({ action: '/core/tvdb/checklinks' });
}
// Update MovieDB info
function getCoreMoviedbUpdate() {
  return Api.call({ action: '/core/moviedb/update' });
}
// Update images
function getCoreImagesUpdate() {
  return Api.call({ action: '/core/images/update' });
}
// Validate images
function getImageValidateall() {
  return Api.call({ action: '/image/validateall' });
}
function getPlexSync() {
  return Api.call({ action: '/sync/all', endpoint: '/plex' });
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
