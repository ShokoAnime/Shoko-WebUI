import type { IncludeOnlyFilterType } from '@/core/react-query/types';

export type TmdbCrossReferenceSectionType = 'Movie' | 'Show' | 'Episode';

export type TmdbExportRequestType = {
  /** Sections to include in the output file. Nothing is exported if empty. */
  SectionSet: TmdbCrossReferenceSectionType[];
  /** `false` keeps only user-verified links, `only` keeps only automatic links. */
  Automatic: IncludeOnlyFilterType;
  /** Filters show and episode links by whether they are mapped to a TMDB episode. */
  WithEpisodes: IncludeOnlyFilterType;
  IncludeComments: boolean;
  AnidbAnimeID?: number;
  AnidbEpisodeID?: number;
  TmdbMovieID?: number;
  TmdbShowID?: number;
  TmdbEpisodeID?: number;
};

export type TmdbImportRequestType = {
  file: File;
  removeExisting: boolean;
  addMissingMovies: boolean;
  addMissingShows: boolean;
};
