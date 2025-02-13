import type { PaginationType } from '@/core/types/api';

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
  OrderingType?: AlternateOrderingTypeEnum;

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

export const enum AlternateOrderingTypeEnum {
  Unknown = 'Unknown',
  OriginalAirDate = 'OriginalAirDate',
  Absolute = 'Absolute',
  DVD = 'DVD',
  Digital = 'Digital',
  StoryArc = 'StoryArc',
  Production = 'Production',
  TV = 'TV',
}
