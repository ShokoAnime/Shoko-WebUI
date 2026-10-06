import type { IncludeOnlyFilterType } from '@/core/react-query/types';
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

/**
 * The new order of one or more kinds' providers, for `PUT Metadata/Source/{source}/Providers`. Kinds left out are
 * kept, and providers left out of a kind keep their place after the given ones.
 */
export type MetadataSourceProvidersUpdateRequestType = {
  EntityType: string;
  Providers: { ProviderID: string, IsEnabled: boolean, Priority: number }[];
}[];

export type MetadataCrossReferenceSectionType = 'Movie' | 'Series' | 'Episode';

export type MetadataExportRequestType = {
  /** The sections to write, or every one when empty. */
  Sections: MetadataCrossReferenceSectionType[];
  /** `false` keeps only the links a person made, `only` only the automatic ones. */
  Automatic: IncludeOnlyFilterType;
  /** Filters series and episode links by whether they are mapped to an episode. */
  WithEpisodes: IncludeOnlyFilterType;
  IncludeComments: boolean;
  AnidbAnimeID?: number;
  AnidbEpisodeID?: number;
  /** The source's own IDs. */
  SeriesID?: string;
  EpisodeID?: string;
  MovieID?: string;
};

export type MetadataImportRequestType = {
  file: File;
  removeExisting: boolean;
  addMissingSeries: boolean;
  addMissingMovies: boolean;
};
