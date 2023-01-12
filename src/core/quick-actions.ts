const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    function: 'SyncVotes',
    info: 'Sync Votes from Shoko to AniDB',
  },
  'sync-mylist': {
    name: 'Sync AniDB MyList',
    function: 'SyncMyList',
    info: 'Syncs all of the states in Shoko\'s library to AniDB. BEWARE THIS IS ONE WAY AND CAN ERASE ANIDB DATA IRREVERSIBLY',
  },
  'download-missing-anidb-data': {
    name: 'Download Missing AniDB Data',
    function: 'DownloadMissingAniDBAnimeData',
    info: 'Force downloads XML data from AniDB. This should only be necessary if the XML has been edited/deleted or Shoko has closed/crashed unexpectedly',
  },
  'update-anidb-calendar': {
    name: 'Update AniDB Calendar',
    function: 'UpdateAnidbCalendar',
    info: 'Updates Shoko\'s \'Upcoming Anime\' calendar with the latest data from AniDB',
  },
  'update-all-anidb-info': {
    name: 'Update All AniDB Info',
    function: 'UpdateAllAniDBInfo',
    info: 'Updates All AniDB Series Info*',
  },
  'sync-trakt': {
    name: 'Sync Trakt Collection',
    function: 'SyncTrakt',
    info: 'Sync states from Trakt into Shoko - if you have Trakt setup*',
  },
  'update-all-trakt-info': {
    name: 'Update All Trakt Info',
    function: 'UpdateAllTraktInfo',
    info: 'Sync all Trakt info into Shoko*',
  },
  'update-all-tvdb-info': {
    name: 'Update All TvDB Info',
    function: 'UpdateAllTvDBInfo',
    info: 'Updates all TvDB Series Info*',
  },
  'regen-tvdb-links': {
    name: 'Regenerate TvDB Links',
    function: 'RegenerateAllTvDBEpisodeMatchings',
    info: 'Regenerate all episode matchings for TvDB. You should not need to run this unless someone from the Shoko team or the release notes have told you to',
  },
  'run-import': {
    name: 'Run Import',
    function: 'RunImport',
    info: 'Checks for new files in your Shoko folders, hashes them, and scans sites (AniDB, TvDB, etc) for metadata and images',
  },
  'avdump-mismatched-files': {
    name: 'AVDump Mismatched Files',
    function: 'AVDumpMismatchedFiles',
    info: 'Used by the \'Unrecognized\' utility to find files in your library that don\'t match to a file in AniDB.',
  },
  'update-all-mediainfo': {
    name: 'Update All Mediainfo',
    function: 'UpdateAllMediaInfo',
    info: 'Updates all media info*',
  },
  'update-series-stats': {
    name: 'Update Series Stats',
    function: 'UpdateSeriesStats',
    info: 'Recalculates series stats and group filters*',
  },
  'sync-hashes': {
    name: 'Sync Hashes',
    function: 'SyncHashes',
  },
  'update-all-images': {
    name: 'Update All Images',
    function: 'UpdateAllImages',
    info: 'Updates and downloads any missing images',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    function: 'ValidateAllImages',
    info: 'Finds any invalid images and redownloads them',
  },
  'update-all-moviedb-info': {
    name: 'Update All MovieDB Info',
    function: 'UpdateAllMovieDBInfo',
    info: 'Updates all MovieDB info*',
  },
  'plex-sync-all': {
    name: 'Sync Plex Watch Status',
    function: 'PlexSyncAll',
  },
  'remove-missing-files-mylist': {
    name: 'Remove Missing Files',
    function: 'RemoveMissingFiles',
    data: true,
    info: 'Removes entries in Shoko and MyList for files thats are no longer accessible',
  },
  'remove-missing-files': {
    name: 'Remove Missing Files (Keep in MyList)',
    function: 'RemoveMissingFiles',
    data: false,
    info: 'Removes entries in Shoko (but keeps them in MyList) for files thats are no longer accessible',
  },
  'recreate-all-groups': {
    name: 'Recreate All Groups',
    function: 'RecreateAllGroups',
    data: false,
    info: 'Deletes all existing groups in Shoko and recreates them',
  },
};

export default quickActions;
