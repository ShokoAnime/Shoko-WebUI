const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    functionName: 'SyncVotes',
    info: 'Sync Series & Episode Votes from Shoko to AniDB.',
  },
  'sync-mylist': {
    name: 'OVERWRITE AniDB MyList',
    functionName: 'SyncMyList',
    info:
      'Syncs all Series & Episode watch state data from Shoko to AniDB. THIS IS A ONE-WAY ACTION AND WILL OVERWRITE ALL ANIDB DATA!',
  },
  'add-all-manually-linked-files-to-mylist': {
    name: 'Add All Manual Links To MyList',
    functionName: 'AddAllManualLinksToMyList',
    info: 'Syncs Manually Linked Episodes to your MyList. File entries on AniDB will show up as Generic.',
  },
  'download-missing-anidb-data': {
    name: 'Download Missing AniDB Data',
    functionName: 'DownloadMissingAniDBAnimeData',
    info:
      'Downloads XML data from AniDB forcefully. Use this only if the XML has been edited, deleted, or if Shoko has unexpectedly closed or crashed.',
  },
  'update-anidb-calendar': {
    name: 'Update AniDB Calendar',
    functionName: 'UpdateAnidbCalendar',
    info: 'Updates  the \'Upcoming Anime\' calendar in Shoko with the most recent information from AniDB.',
  },
  'update-all-anidb-info': {
    name: 'Update All AniDB Info',
    functionName: 'UpdateAllAniDBInfo',
    info: 'Update all Series information with the latest data from AniDB.',
  },
  'get-anidb-notifications': {
    name: 'Get AniDB Notifications',
    functionName: 'GetAniDBNotifications',
    info: 'Fetch unread notifications and messages from AniDB',
  },
  'process-moved-files': {
    name: 'Process Moved Files',
    functionName: 'RefreshAniDBMovedFiles',
    info: 'Process file moved messages from AniDB. This will force an update on the affected files.',
  },
  'send-watch-states-trakt': {
    name: 'Send Watch States to Trakt',
    functionName: 'SendWatchStatesToTrakt',
    info: 'Send missing watch states to Trakt. This does not overwrite Trakt data.',
  },
  'get-watch-states-trakt': {
    name: 'Get Watch States from Trakt',
    functionName: 'GetWatchStatesFromTrakt',
    info: 'Get missing watch states fom Trakt. This does not overwrite local data.',
  },
  'run-import': {
    name: 'Run Import',
    functionName: 'RunImport',
    info:
      'This checks for new files, hashes them etc, scans Drop Folders, checks and scans for community site links (trakt, tmdb, etc), and downloads missing images.',
  },
  'import-new-files': {
    name: 'Import New Files',
    functionName: 'ImportNewFiles',
    info: 'Queues a task to import only new files found in the import folder',
  },
  'avdump-mismatched-files': {
    name: 'AVDump Mismatched Files',
    functionName: 'AVDumpMismatchedFiles',
    info: 'Scans the library, detects files without a hash match in AniDB, and runs AVDump on them.',
  },
  'update-all-mediainfo': {
    name: 'Update All Mediainfo',
    functionName: 'UpdateAllMediaInfo',
    info: 'Runs MediaInfo on every file in your collection to update their metadata.',
  },
  'update-series-stats': {
    name: 'Update Series Stats',
    functionName: 'UpdateSeriesStats',
    info: 'Updates all series in your collection, recalculating totals, remainders, and watched statuses of items.',
  },
  'update-missing-anidb-file-release-groups': {
    name: 'Update Missing AniDB Release Groups',
    functionName: 'UpdateMissingAniDBFileInfo?missingInfo=true&outOfDate=false',
    info: 'Checks AniDB for updated data on files in your collection that lack a release group.',
  },
  'update-missing-anidb-file-info': {
    name: 'Update Missing AniDB File Info',
    functionName: 'UpdateMissingAniDBFileInfo?missingInfo=true&outOfDate=true',
    info:
      'Updates AniDB files lacking file information, including those missing release groups and those with outdated internal data versions.',
  },
  'update-all-images': {
    name: 'Update All Images',
    functionName: 'UpdateAllImages',
    info: 'Updates and downloads all missing images from AniDB and TMDB.',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    functionName: 'ValidateAllImages',
    info: 'Identifies any invalid images and re-downloads them.',
  },
  'search-for-tmdb-matches': {
    name: 'Search for TMDB Matches',
    functionName: 'SearchForTmdbMatches',
    info: 'Scan for TMDB matches for all unlinked AniDB anime.',
  },
  'update-all-tmdb-movies': {
    name: 'Update All TMDB Movies',
    functionName: 'UpdateAllTmdbMovies',
    info: 'Updates all TMDB Movies in the local database.',
  },
  'update-all-tmdb-shows': {
    name: 'Update All TMDB Shows',
    functionName: 'UpdateAllTmdbShows',
    info: 'Updates all TMDB Shows in the local database.',
  },
  'delete-unused-tmdb-movies': {
    name: 'Delete Unused TMDB Movies',
    functionName: 'PurgeAllUnusedTmdbMovies',
    info: 'Deletes all unused TMDB Movies that are not linked to any AniDB anime.',
  },
  'delete-unused-tmdb-shows': {
    name: 'Delete Unused TMDB Shows',
    functionName: 'PurgeAllUnusedTmdbShows',
    info: 'Deletes all unused TMDB Shows that are not linked to any AniDB anime.',
  },
  'download-missing-tmdb-people': {
    name: 'Download Missing TMDB People',
    functionName: 'DownloadMissingTmdbPeople',
    info: 'Downloads any TMDB People missing in the local database.',
  },
  'purge-tmdb-movie-collections': {
    name: 'Delete All TMDB Movie Collections',
    functionName: 'PurgeAllTmdbMovieCollections',
    info:
      'Deletes all TMDB Movie Collections stored in the local database, and removes any images associated with them.',
  },
  'purge-tmdb-show-alternate-orderings': {
    name: 'Delete All TMDB Show Alternate Orderings',
    functionName: 'PurgeAllTmdbShowAlternateOrderings',
    info: 'Deletes all TMDB Show Alternate Orderings stored in the local database.',
  },
  'plex-sync-all': {
    name: 'Sync Plex Watch Status',
    functionName: 'PlexSyncAll',
    info: 'Synchronizes watch states with Plex.',
  },
  'plex-force-unlink': {
    name: 'Force Unlink Plex',
    functionName: '',
    info: 'Invalidates the Plex token forcefully.',
  },
  'remove-missing-files-mylist': {
    name: 'Remove Missing Files',
    functionName: 'RemoveMissingFiles/true',
    info: 'Deletes entries in Shoko and MyList for files that are no longer accessible.',
  },
  'remove-missing-files': {
    name: 'Remove Missing Files (Keep in MyList)',
    functionName: 'RemoveMissingFiles/false',
    info: 'Deletes entries in Shoko, while retaining them in MyList, for files that are no longer accessible.',
  },
  'recreate-all-groups': {
    name: 'Recreate All Groups',
    functionName: 'RecreateAllGroups',
    info: 'Deletes all existing groups in Shoko and recreates them.',
  },
  'rename-all-groups': {
    name: 'Rename All Groups',
    functionName: 'RenameAllGroups',
    info: 'Renames all default groups, excluding those with custom names, using the current language settings.',
  },
} as Record<string, {
  name: string;
  functionName: string;
  info: string;
}>;

export default quickActions;
