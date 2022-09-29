const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    function: 'SyncVotes',
  },
  'sync-mylist': {
    name: 'Sync AniDB MyList',
    function: 'SyncMyList',
  },
  'download-missing-anidb-data': {
    name: 'Download Missing AniDB Data',
    function: 'DownloadMissingAniDBAnimeData',
  },
  'update-anidb-calendar': {
    name: 'Update AniDB Calendar',
    function: 'UpdateAnidbCalendar',
  },
  'update-all-anidb-info': {
    name: 'Update All AniDB Info',
    function: 'UpdateAllAniDBInfo',
  },
  'sync-trakt': {
    name: 'Sync Trakt Collection',
    function: 'SyncTrakt',
  },
  'update-all-trakt-info': {
    name: 'Update All Trakt Info',
    function: 'UpdateAllTraktInfo',
  },
  'update-all-tvdb-info': {
    name: 'Update All TvDB Info',
    function: 'UpdateAllTvDBInfo',
  },
  'regen-tvdb-links': {
    name: 'Regenerate TvDB Links',
    function: 'RegenerateAllTvDBEpisodeMatchings',
  },
  'run-import': {
    name: 'Run Import',
    function: 'RunImport',
  },
  'avdump-mismatched-files': {
    name: 'AVDump Mismatched Files',
    function: 'AVDumpMismatchedFiles',
  },
  'update-all-mediainfo': {
    name: 'Update All Mediainfo',
    function: 'UpdateAllMediaInfo',
  },
  'update-series-stats': {
    name: 'Update Series Stats',
    function: 'UpdateSeriesStats',
  },
  'sync-hashes': {
    name: 'Sync Hashes',
    function: 'SyncHashes',
  },
  'update-all-images': {
    name: 'Update All Images',
    function: 'UpdateAllImages',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    function: 'ValidateAllImages',
  },
  'update-all-moviedb-info': {
    name: 'Update All MovieDB Info',
    function: 'UpdateAllMovieDBInfo',
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
  },
};

export default quickActions;
