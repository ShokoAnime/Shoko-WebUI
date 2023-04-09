const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    function: 'getSyncVotes',
  },
  'sync-mylist': {
    name: 'Sync AniDB MyList',
    function: 'getSyncMyList',
  },
  'add-all-manually-linked-files-to-mylist': {
    name: 'Add All Manual Links To MyList',
    function: 'getAddAllManualLinksToMyList',
  },
  'download-missing-anidb-data': {
    name: 'Download Missing AniDB Data',
    function: 'getDownloadMissingAniDBAnimeData',
  },
  'update-all-anidb-info': {
    name: 'Update All AniDB Info',
    function: 'getUpdateAllAniDBInfo',
  },
  'sync-trakt': {
    name: 'Sync Trakt Collection',
    function: 'getSyncTrakt',
  },
  'update-all-trakt-info': {
    name: 'Update All Trakt Info',
    function: 'getUpdateAllTraktInfo',
  },
  'update-all-tvdb-info': {
    name: 'Update All TvDB Info',
    function: 'getUpdateAllTvDBInfo',
  },
  'regen-tvdb-links': {
    name: 'Regenerate TvDB Links',
    function: 'getRegenerateAllTvDBEpisodeMatchings',
  },
  'run-import': {
    name: 'Run Import',
    function: 'getRunImport',
  },
  'avdump-mismatched-files': {
    name: 'AVDump Mismatched Files',
    function: 'getAVDumpMismatchedFiles',
  },
  'update-all-mediainfo': {
    name: 'Update All Mediainfo',
    function: 'getUpdateAllMediaInfo',
  },
  'update-series-stats': {
    name: 'Update Series Stats',
    function: 'getUpdateSeriesStats',
  },
  'update-missing-anidb-file-release-groups': {
    name: 'Update Missing AniDB Release Groups',
    function: 'getUpdateMissingAniDBFileInfo',
    data: false,
  },
  'update-missing-anidb-file-info': {
    name: 'Update Missing AniDB File Info',
    function: 'getUpdateMissingAniDBFileInfo',
    data: true,
  },
  'update-all-images': {
    name: 'Update All Images',
    function: 'getUpdateAllImages',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    function: 'getValidateAllImages',
  },
  'update-all-moviedb-info': {
    name: 'Update All MovieDB Info',
    function: 'getUpdateAllMovieDBInfo',
  },
  'plex-sync-all': {
    name: 'Sync Plex Watch Status',
    function: 'getPlexSyncAll',
  },
  'remove-missing-files-mylist': {
    name: 'Remove Missing Files',
    function: 'getRemoveMissingFiles',
    data: true,
  },
  'remove-missing-files': {
    name: 'Remove Missing Files (Keep in MyList)',
    function: 'getRemoveMissingFiles',
    data: false,
  },
  'recreate-all-groups': {
    name: 'Recreate All Groups',
    function: 'getRecreateAllGroups',
    data: false,
  },
  'import-new-files': {
    name: 'Import new files',
    function: 'getImportNewFiles',
    data: false,
  },
};

export default quickActions;
