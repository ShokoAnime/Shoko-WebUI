import Api from '../index';

function ApiRequest(action: string, expectEmpty = true) {
  return Api.call({ action: `/v3/Action/${action}`, expectEmpty });
}

// This was for web cache hash syncing, and will be for perceptual hashing maybe eventually.
function getSyncHashes() {
  return ApiRequest('SyncHashes');
}

// BEWARE this is a dangerous command! It syncs all of the states in Shoko's library to AniDB.
// ONE WAY. THIS CAN ERASE ANIDB DATA IRREVERSIBLY
function getSyncMyList() {
  return ApiRequest('SyncMyList');
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

// Update All AniDB Series Info
function getUpdateAllAniDBInfo() {
  return ApiRequest('UpdateAllAniDBInfo');
}

// Queues a task to Update all media info
function getUpdateAllMediaInfo() {
  return ApiRequest('UpdateAllMediaInfo');
}

// Update All TvDB Series Info
function getUpdateAllTvDBInfo() {
  return ApiRequest('UpdateAllTvDBInfo');
}

// Updates and Downloads Missing Images
function getUpdateAllImages() {
  return ApiRequest('UpdateAllImages');
}

// Update all Trakt info. Right now, that's not much.
function getUpdateAllTraktInfo() {
  return ApiRequest('UpdateAllTraktInfo');
}

// Queues commands to Update All Series Stats and Force a Recalculation of All Group Filters
function getUpdateSeriesStats() {
  return ApiRequest('UpdateSeriesStats');
}

// Validates all images
function getValidateAllImages() {
  return ApiRequest('ValidateAllImages');
}

export default {
  getSyncHashes,
  getSyncMyList,
  getSyncVotes,
  getSyncTrakt,
  getRemoveMissingFiles,
  getUpdateAllAniDBInfo,
  getUpdateAllMediaInfo,
  getUpdateAllTvDBInfo,
  getUpdateAllImages,
  getUpdateAllTraktInfo,
  getUpdateSeriesStats,
  getValidateAllImages,
};
