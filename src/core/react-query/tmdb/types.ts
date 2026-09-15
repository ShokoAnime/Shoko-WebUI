import type { IncludeOnlyFilterType } from '@/core/react-query/types';
import type { PaginationType } from '@/core/types/api';

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

export type TmdbRefreshRequestType = {
  tmdbId: number;
  Force?: boolean;
  DownloadImages?: boolean;
  Immediate?: boolean;
  SkipIfExists?: boolean;
};

export type TmdbBulkRequestType = {
  IDs: number[];
};

export type TmdbAddLinkRequestType = {
  ID: number;
  EpisodeID?: number;
  Replace?: boolean;
  Refresh?: boolean;
};

export type TmdbAddAutoXrefsRequestType = {
  tmdbShowID: number;
};

export type TmdbDeleteLinkRequestType = {
  ID: number;
  EpisodeID?: number;
  Purge?: boolean;
};

export type TmdbSearchRequestType = {
  includeRestricted?: boolean;
  year?: number;
} & PaginationType;

export type TmdbEpisodeXrefMappingRequestType = {
  AniDBID: number;
  TmdbID: number;
  Replace?: boolean;
  Index?: number | null;
};

export type TmdbEditEpisodeXrefsRequestType = {
  ResetAll?: boolean;
  Mapping: TmdbEpisodeXrefMappingRequestType[];
};

export type TmdbShowEpisodesRequestType = {
  search?: string;
} & PaginationType;

export type TmdbShowOrderingInformationType = {
  /**
   * The ordering ID.
   */
  OrderingID: string;

  /**
   * The alternate ordering type. Will not be set if the main ordering is
   * used.
   */
  OrderingType?: AlternateOrderingTypeValues;

  /**
   * English name of the ordering scheme.
   */
  OrderingName: string;

  /**
   * The number of episodes in the ordering scheme.
   */
  EpisodeCount: number;

  /**
   * The number of hidden episodes in the ordering scheme.
   */
  HiddenEpisodeCount: number;

  /**
   * The number of seasons in the ordering scheme.
   */
  SeasonCount: number;

  /**
   * Indicates the current ordering is the default ordering for the show.
   */
  IsDefault: boolean;

  /**
   * Indicates the current ordering is the preferred ordering for the show.
   */
  IsPreferred: boolean;

  /**
   * Indicates the current ordering is in use for the show.
   */
  InUse: boolean;
};

export type AlternateOrderingTypeValues =
  | 'Unknown'
  | 'OriginalAirDate'
  | 'Absolute'
  | 'DVD'
  | 'Digital'
  | 'StoryArc'
  | 'Production'
  | 'TV';
