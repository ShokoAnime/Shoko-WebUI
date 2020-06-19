import Api from './index';

// Run Import action on all Import Folders
function getFolderImport() {
  return Api.call({ action: '/folder/import', expectEmpty: true });
}
// Scan All Drop Folders
function getFolderScan() {
  return Api.call({ action: '/folder/scan', expectEmpty: true });
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
function getAvdumpmismatchedfiles() {
  return Api.call({ action: '/avdumpmismatchedfiles', expectEmpty: true });
}
// Update AniDB missing files
function getAnidbUpdatemissingcache() {
  return Api.call({ action: '/anidb/updatemissingcache', expectEmpty: true });
}
// Scan Trakt
function getTraktScan() {
  return Api.call({ action: '/trakt/scan', expectEmpty: true });
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
function getPlexSync() {
  return Api.call({ action: '/sync/all', endpoint: '/plex', expectEmpty: true });
}

export default {
  getFolderImport,
  getFolderScan,
  getRescanunlinked,
  getRescanmanuallinks,
  getAvdumpmismatchedfiles,
  getAnidbUpdatemissingcache,
  getTraktScan,
  getTvdbRegenlinks,
  getTvdbChecklinks,
  getMoviedbUpdate,
  getPlexSync,
};
