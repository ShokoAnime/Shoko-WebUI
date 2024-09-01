import type { PaginationType } from '@/core/types/api';

export type TmdbEpisodeXrefRequestType = {
  tmdbShowID?: number;
} & PaginationType;

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

type TmdbEpisodeXrefMappingRequestType = {
  AniDBID: number;
  TmdbID: number;
  Replace?: boolean;
};

export type TmdbEditEpisodeXrefsRequestType = {
  ResetAll?: boolean;
  Mapping: TmdbEpisodeXrefMappingRequestType[];
};

export type TmdbShowEpisodesRequestType = {
  search?: string;
} & PaginationType;
