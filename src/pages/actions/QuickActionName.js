import React from 'react';

const actions = {
  'folder-import': 'Run Import',
  'folder-scan': 'Scan All Folders',
  'remove-missing-files': 'Remove Missing Files',
  'stats-update': '',
  'mediainfo-update': '',
  'hash-sync': '',
  'rescanunlinked': '',
  'rescanmanuallinks': '',
  'rehashunlinked': '',
  'rehashmanuallinks': '',
  'avdumpmismatchedfiles': '',
  'core-anidb-votes-sync': '',
  'core-anidb-list-sync': '',
  'core-anidb-update': '',
  'core-anidb-updatemissingcache': '',
  'core-trakt-sync': '',
  'core-trakt-scan': '',
  'core-tvdb-update': '',
  'core-tvdb-regenlinks': '',
  'core-tvdb-checklinks': '',
  'core-moviedb-update': '',
  'core-images-update': '',
  'image-validateall': '',
  'plex-sync': '',
};

export default ({ id }) => (<span>{actions[id] || id}</span>);
