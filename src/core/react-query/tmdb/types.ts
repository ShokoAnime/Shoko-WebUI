import type { PaginationType } from '@/core/types/api';

export type TmdbEpisodeXRefRequestType = {
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

export type TmdbAddAutoCrossReferencesRequestType = {
  tmdbShowID: number;
};

export type TmdbDeleteLinkRequestType = {
  ID: number;
  EpisodeID?: number;
  Purge?: boolean;
};
