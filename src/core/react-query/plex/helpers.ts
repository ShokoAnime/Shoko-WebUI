import type { PlexLibraryType } from '@/core/types/api/plex';

export const transformLibraries = (response: PlexLibraryType[]) =>
  response.filter(library => library.Agent === 'com.plexapp.agents.shoko');
