import type { PaginationType } from '@/core/types/api';

/** The kind of entry a series is linked to, as the linking page names it. */
export type MetadataLinkType = 'Show' | 'Movie';

export type MetadataSearchRequestType = {
  includeRestricted?: boolean;
  year?: number;
} & PaginationType;

export type MetadataRefreshRequestType = {
  id: string;
  Force?: boolean;
  DownloadImages?: boolean;
  Immediate?: boolean;
  SkipIfExists?: boolean;
};

export type MetadataAddLinkRequestType = {
  ID: string;
  EpisodeID?: number;
  Replace?: boolean;
  Refresh?: boolean;
};

export type MetadataDeleteLinkRequestType = {
  ID?: string;
  EpisodeID?: number;
  Purge?: boolean;
};

export type MetadataSeriesEpisodesRequestType = {
  /**
   * An episode number (`5`, `E5`, `#5`), a season (`S1`, `S1E5`), a special (`Special 3`, `Specials`), or else
   * part of a title.
   */
  search?: string;
} & PaginationType;

export type MetadataEpisodeLinkRequestType = {
  AniDBID: number;
  /** The source's episode ID; empty links the AniDB episode to nothing. */
  ID: string;
  Replace?: boolean;
  Index?: number | null;
};

export type MetadataEditEpisodeLinksRequestType = {
  UnsetAll?: boolean;
  Mapping: MetadataEpisodeLinkRequestType[];
};

export type MetadataProviderUpdateRequestType = {
  providerId: string;
  /** The kinds to turn the provider on for; every other kind is turned off. */
  EnabledEntityTypes?: string[];
  IsAutoLinker?: boolean;
  AutoLink?: boolean;
  AutoLinkRestricted?: boolean;
};

/**
 * The new order of one or more kinds' providers, for `PUT Metadata/Source/{source}/Providers`. Kinds left out are
 * kept, and providers left out of a kind keep their place after the given ones.
 */
export type MetadataSourceProvidersUpdateRequestType = {
  EntityType: string;
  Providers: { ProviderID: string, IsEnabled: boolean, Priority: number }[];
}[];
