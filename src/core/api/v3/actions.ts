import Api from '../index';
import { getRecreateAllGroups } from './group';
import { getPlexSyncAll } from './plex';

function ApiRequest(action: string, expectEmpty = true) {
  return Api.call({ action: `/v3/Action/${action}`, expectEmpty });
}

// Run Import. This checks for new files, hashes them etc, scans Drop Folders, checks and scans
// for community site links (tvdb, trakt, moviedb, etc), and downloads missing images.
function getRunImport() {
  return ApiRequest('RunImport');
}

// Sync the votes from Shoko to AniDB.
function getSyncVotes() {
  return ApiRequest('SyncVotes');
}

// Sync Trakt states. Requires Trakt to be set up, obviously
function getSyncTrakt() {
  return ApiRequest('SyncTrakt');
}

// Remove Entries in the Shoko Database for Files that are no longer accessible
function getRemoveMissingFiles(removeFromMyList: boolean) {
  return ApiRequest(`RemoveMissingFiles/${removeFromMyList}`);
}

// Update All TvDB Series Info
function getUpdateAllTvDBInfo() {
  return ApiRequest('UpdateAllTvDBInfo');
}

// Updates and Downloads Missing Images
function getUpdateAllImages() {
  return ApiRequest('UpdateAllImages');
}

// Updates All MovieDB Info
function getUpdateAllMovieDBInfo() {
  return ApiRequest('UpdateAllMovieDBInfo');
}

// Update all Trakt info. Right now, that's not much.
function getUpdateAllTraktInfo() {
  return ApiRequest('UpdateAllTraktInfo');
}

// Validates all images
function getValidateAllImages() {
  return ApiRequest('ValidateAllImages');
}

// Gets files whose data does not match AniDB
function getAVDumpMismatchedFiles() {
  return ApiRequest('AVDumpMismatchedFiles');
}

// This Downloads XML data from AniDB where there is none. This should only happen:
// A. If someone deleted or corrupted them.
// B. If the server closed unexpectedly at the wrong time (it'll only be one).
// C. If there was a catastrophic error.
function getDownloadMissingAniDBAnimeData() {
  return ApiRequest('DownloadMissingAniDBAnimeData');
}

// Regenerate All Episode Matchings for TvDB. Generally, don't do this unless there was an error
// that was fixed. In those cases, you'd be told to.
function getRegenerateAllTvDBEpisodeMatchings() {
  return ApiRequest('RegenerateAllTvDBEpisodeMatchings');
}

// BEWARE this is a dangerous command! It syncs all of the states in Shoko's library to AniDB.
// ONE WAY. THIS CAN ERASE ANIDB DATA IRREVERSIBLY
function getSyncMyList() {
  return ApiRequest('SyncMyList');
}

// Update All AniDB Series Info
function getUpdateAllAniDBInfo() {
  return ApiRequest('UpdateAllAniDBInfo');
}

// Queues a task to Update all media info
function getUpdateAllMediaInfo() {
  return ApiRequest('UpdateAllMediaInfo');
}

// Queues commands to Update All Series Stats and Force a Recalculation of All Group Filters
function getUpdateSeriesStats() {
  return ApiRequest('UpdateSeriesStats');
}

// Queues a task to import only new files found in the import folder
function getImportNewFiles() {
  return ApiRequest('ImportNewFiles');
}

// Forcibly schedules commands to add the files to MyList for all manual linked files.
function getAddAllManualLinksToMyList() {
  return ApiRequest('AddAllManualLinksToMyList');
}

// Update AniDB Files with missing file info, including with missing release groups and/or with
// out-of-date internal data versions.
function getUpdateMissingAniDBFileInfo(outOfDate: boolean) {
  return ApiRequest(`UpdateMissingAniDBFileInfo?missingInfo=true&outOfDate=${outOfDate}`);
}

export default {
  getRunImport,
  getSyncVotes,
  getSyncTrakt,
  getRemoveMissingFiles,
  getUpdateAllTvDBInfo,
  getUpdateAllImages,
  getUpdateAllMovieDBInfo,
  getUpdateAllTraktInfo,
  getValidateAllImages,
  getAVDumpMismatchedFiles,
  getDownloadMissingAniDBAnimeData,
  getRegenerateAllTvDBEpisodeMatchings,
  getSyncMyList,
  getUpdateAllAniDBInfo,
  getUpdateAllMediaInfo,
  getUpdateSeriesStats,
  getPlexSyncAll,
  getRecreateAllGroups,
  getImportNewFiles,
  getAddAllManualLinksToMyList,
  getUpdateMissingAniDBFileInfo,
};