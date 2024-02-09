const quickActions = {
  'sync-votes': {
    name: 'Sync AniDB Votes',
    functionName: 'SyncVotes',
    info: 'Sync Series & Episode Votes from Shoko to AniDB.',
  },
  'sync-mylist': {
    name: 'Sync AniDB MyList',
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
  'sync-trakt': {
    name: 'Sync Trakt Collection',
    functionName: 'SyncTrakt',
    info: 'Sync watch states from Shoko to Trakt. THIS IS A ONE-WAY ACTION AND WILL OVERWRITE ALL TRAKT DATA!',
  },
  'update-all-trakt-info': {
    name: 'Update All Trakt Info',
    functionName: 'UpdateAllTraktInfo',
    info: 'Sync all info for Series from Trakt to Shoko.',
  },
  'update-all-tvdb-info': {
    name: 'Update All TvDB Info',
    functionName: 'UpdateAllTvDBInfo',
    info: 'Update all Series information with the latest data from TvDB.',
  },
  'regen-tvdb-links': {
    name: 'Regenerate TvDB Links',
    functionName: 'RegenerateAllTvDBEpisodeMatchings',
    info:
      'Recreates all episode matches for TvDB. This action is generally not required unless specifically instructed by a member of the Shoko team or mentioned in the release notes.',
  },
  'run-import': {
    name: 'Run Import',
    functionName: 'RunImport',
    info:
      'Scans for new files in Shoko folders, computes their hashes, and searches AniDB and TvDB for metadata and images.',
  },
  'import-new-files': {
    name: 'Import New Files',
    functionName: 'ImportNewFiles',
    info: 'Scans import folders and imports only the new files identified within the import folder.',
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
    info: 'Updates and downloads all missing images from AniDB and TvDB.',
  },
  'validate-all-images': {
    name: 'Validate All Images',
    functionName: 'ValidateAllImages',
    info: 'Identifies any invalid images and re-downloads them.',
  },
  'update-all-moviedb-info': {
    name: 'Update All MovieDB Info',
    functionName: 'UpdateAllMovieDBInfo',
    info: 'Updates information for all movie-related entries in your collection.',
  },
  'plex-sync-all': {
    name: 'Sync Plex Watch Status',
    functionName: 'PlexSyncAll',
    info: 'Synchronizes watch states with Plex.',
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
