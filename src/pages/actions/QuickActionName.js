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
  'core-anidb-votes-sync': 'Sync AniDB Votes',
  'core-anidb-list-sync': 'Sync AniDB MyList',
  'core-anidb-update': 'Update All AniDB Series Info',
  'core-anidb-updatemissingcache': 'Update AniDB Missing Cache',
  'core-trakt-sync': 'Sync Trakt Collection',
  'core-trakt-scan': 'Scan Trakt',
  'core-tvdb-update': 'Update All TvDB Info',
  'core-tvdb-regenlinks': 'Regen TvDB Links',
  'core-tvdb-checklinks': 'Check TvDB Links',
  'core-moviedb-update': 'Update All MovieDB Info',
  'core-images-update': 'Update Images',
  'image-validateall': 'Validate All Images',
  'plex-sync': 'Sync Plex Watch Status',
};

export default ({ id }) => (<span>{actions[id] || id}</span>);
