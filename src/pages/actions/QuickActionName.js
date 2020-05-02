/* eslint-disable react/prop-types */
import React from 'react';

const actions = {
  'folder-import': 'Run Import',
  'folder-scan': 'Scan All Folders',
  'remove-missing-files': 'Remove Missing Files',
  'stats-update': 'Update All Stats',
  'mediainfo-update': 'Update All Media Info',
  'hash-sync': 'Sync Hashes',
  rescanunlinked: 'Rescan Unlinked',
  rescanmanuallinks: 'Rescan Manual',
  rehashunlinked: 'Rehash Unlinked',
  rehashmanuallinks: 'Rehash Manual',
  avdumpmismatchedfiles: 'AVDump mismatched',
  'anidb-votes-sync': 'Sync AniDB Votes',
  'anidb-list-sync': 'Sync AniDB MyList',
  'anidb-update': 'Update All AniDB Series Info',
  'anidb-updatemissingcache': 'Update AniDB Missing Cache',
  'trakt-sync': 'Sync Trakt Collection',
  'trakt-scan': 'Scan Trakt',
  'tvdb-update': 'Update All TvDB Info',
  'tvdb-regenlinks': 'Regen TvDB Links',
  'tvdb-checklinks': 'Check TvDB Links',
  'moviedb-update': 'Update All MovieDB Info',
  'images-update': 'Update Images',
  'image-validateall': 'Validate All Images',
  'plex-sync': 'Sync Plex Watch Status',
};

export default ({ id }) => (<span>{actions[id] || id}</span>);
