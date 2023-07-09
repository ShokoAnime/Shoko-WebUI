const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    functionName: 'SyncVotes',
    info: 'Sync Votes from Shoko to AniDB',
  },
  'sync-mylist': {
    name: 'Sync AniDB MyList',
    functionName: 'SyncMyList',
    info: 'Syncs all of the states in Shoko\'s library to AniDB. BEWARE THIS IS ONE WAY AND CAN ERASE ANIDB DATA IRREVERSIBLY',
  },
  'add-all-manually-linked-files-to-mylist': {
    name: 'Add All Manual Links To MyList',
    functionName: 'AddAllManualLinksToMyList',
    info: 'Forcibly schedules commands to add the files to MyList for all manual linked files.',
  },
  'download-missing-anidb-data': {
    name: 'Download Missing AniDB Data',
    functionName: 'DownloadMissingAniDBAnimeData',
    info: 'Force downloads XML data from AniDB. This should only be necessary if the XML has been edited/deleted or Shoko has closed/crashed unexpectedly',
  },
  'update-anidb-calendar': {
    name: 'Update AniDB Calendar',
    functionName: 'UpdateAnidbCalendar',
    info: 'Updates Shoko\'s \'Upcoming Anime\' calendar with the latest data from AniDB',
  },
  'update-all-anidb-info': {
    name: 'Update All AniDB Info',
    functionName: 'UpdateAllAniDBInfo',
    info: 'Updates All AniDB Series Info*',
  },
  'sync-trakt': {
    name: 'Sync Trakt Collection',
    functionName: 'SyncTrakt',
    info: 'Sync states from Trakt into Shoko - if you have Trakt setup*',
  },
  'update-all-trakt-info': {
    name: 'Update All Trakt Info',
    functionName: 'UpdateAllTraktInfo',
    info: 'Sync all Trakt info into Shoko*',
  },
  'update-all-tvdb-info': {
    name: 'Update All TvDB Info',
    functionName: 'UpdateAllTvDBInfo',
    info: 'Updates all TvDB Series Info*',
  },
  'regen-tvdb-links': {
    name: 'Regenerate TvDB Links',
    functionName: 'RegenerateAllTvDBEpisodeMatchings',
    info: 'Regenerate all episode matchings for TvDB. You should not need to run this unless someone from the Shoko team or the release notes have told you to',
  },
  'run-import': {
    name: 'Run Import',
    functionName: 'RunImport',
    info: 'Checks for new files in your Shoko folders, hashes them, and scans sites (AniDB, TvDB, etc) for metadata and images',
  },
  'import-new-files': {
    name: 'Import New Files',
    functionName: 'ImportNewFiles',
    info: 'Queues a task to import only new files found in the import folder.',
  },
  'avdump-mismatched-files': {
    name: 'AVDump Mismatched Files',
    functionName: 'AVDumpMismatchedFiles',
    info: 'Used by the \'Unrecognized\' utility to find files in your library that don\'t match to a file in AniDB.',
  },
  'update-all-mediainfo': {
    name: 'Update All Mediainfo',
    functionName: 'UpdateAllMediaInfo',
    info: 'Updates all media info*',
  },
  'update-series-stats': {
    name: 'Update Series Stats',
    functionName: 'UpdateSeriesStats',
    info: 'Recalculates series stats and group filters*',
  },
  'update-missing-anidb-file-release-groups': {
    name: 'Update Missing AniDB Release Groups',
    functionName: 'UpdateMissingAniDBFileInfo?missingInfo=true&outOfDate=false',
    info: 'Update AniDB Files with missing release groups.',
  },
  'update-missing-anidb-file-info': {
    name: 'Update Missing AniDB File Info',
    functionName: 'UpdateMissingAniDBFileInfo?missingInfo=true&outOfDate=true',
    info: 'Update AniDB Files with missing file info, including with missing release groups and with out-of-date internal data versions.',
  },
  'update-all-images': {
    name: 'Update All Images',
    functionName: 'UpdateAllImages',
    info: 'Updates and downloads any missing images',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    functionName: 'ValidateAllImages',
    info: 'Finds any invalid images and redownloads them',
  },
  'update-all-moviedb-info': {
    name: 'Update All MovieDB Info',
    functionName: 'UpdateAllMovieDBInfo',
    info: 'Updates all MovieDB info*',
  },
  'plex-sync-all': {
    name: 'Sync Plex Watch Status',
    functionName: 'PlexSyncAll',
    info: 'Sync watch states with plex',
  },
  'remove-missing-files-mylist': {
    name: 'Remove Missing Files',
    functionName: 'RemoveMissingFiles',
    data: true,
    info: 'Removes entries in Shoko and MyList for files thats are no longer accessible',
  },
  'remove-missing-files': {
    name: 'Remove Missing Files (Keep in MyList)',
    functionName: 'RemoveMissingFiles',
    data: false,
    info: 'Removes entries in Shoko (but keeps them in MyList) for files thats are no longer accessible',
  },
  'recreate-all-groups': {
    name: 'Recreate All Groups',
    functionName: 'RecreateAllGroups',
    data: false,
    info: 'Deletes all existing groups in Shoko and recreates them',
  },
  'rename-all-groups': {
    name: 'Rename All Groups',
    functionName: 'RenameAllGroups',
    info: 'Renames any groups without a custom name set based on the current language preference.'
  }
} as {
  [key: string]: {
    name: string;
    functionName: string;
    data?: boolean;
    info: string;
  }
};

export default quickActions;
