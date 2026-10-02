import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { MatchRatingValues } from '@/core/types/api/episode';
import type { PluginInfoType } from '@/core/types/api/plugin';

/** A source series or movies can be linked to, from `GET Metadata/Source`. */
export type MetadataLinkSourceType = {
  /** The source, as routes take it (e.g. `TMDB`). */
  Source: string;
  Name: string;
  /** Whether the source has an icon, served at `Metadata/Source/{source}/Icon`. */
  HasIcon: boolean;
  SupportsSeries: boolean;
  SupportsMovies: boolean;
  IsSeriesEnabled: boolean;
  IsMovieEnabled: boolean;
  Status: MetadataSourceStatusType;
};

/** Whether a source is configured, and whether it is paused. */
export type MetadataSourceStatusType = {
  IsConfigured: boolean;
  NotConfiguredReason: string | null;
  IsPaused: boolean;
  Reason: string | null;
  ResumesAt: string | null;
};

export type MetadataSearchResultType = {
  /** The source's own ID. */
  ID: string;
  Source: string;
  /** `Show` for a series, or `Movie`. */
  Type: string;
  Guid: string;
  /** The entry's page on its source's site, or `null` when it has none. */
  SiteUrl: string | null;
  IsLocal: boolean;
  Title: string;
  AirDate?: string;
  ReleaseDate?: string;
};

export type MetadataAutoSearchOriginValues =
  | 'Search'
  | 'CurrentLink'
  | 'PrequelLink'
  | 'AnidbResource'
  | 'CrossSourceLink';

export type MetadataAutoSearchResultType = {
  ID: string;
  /** Where the match came from. */
  Origin: MetadataAutoSearchOriginValues;
  Result: MetadataSearchResultType;
};

export type MetadataCrossReferenceType = {
  Source: string;
  /** `Show` for a series link, `Episode` for an episode link, or `Movie`. */
  EntityType: string;
  AnidbAnimeID: number;
  AnidbEpisodeID?: number;
  /** The source's ID of the linked entry, or `null` when linked to nothing. */
  ID: string | null;
  /** The linked entry's page on its source's site, or `null` when it has none. */
  SiteUrl: string | null;
  /** The source's ID of the series an episode link points into, if known. */
  ParentID?: string;
  SeasonID?: string;
  SeasonNumber?: number;
  EpisodeNumber?: number;
  Index: number;
  MatchRating: MatchRatingValues;
};

/** An episode of a source's series, from `Metadata/{source}/Series/{id}/Episode` or `…/Episode/Bulk`. */
export type MetadataEpisodeType = {
  ID: string;
  Source: string;
  Guid: string;
  /** The episode's page on its source's site, or `null` when it has none. */
  SiteUrl: string | null;
  Title: string | null;
  /** The source's ID of the series the episode belongs to. */
  SeriesID: string;
  SeasonID: string | null;
  EpisodeType: string;
  EpisodeNumber: number;
  SeasonNumber: number | null;
  AirDate: string | null;
  AiredAt: string | null;
};

export type MetadataMovieType = {
  ID: string;
  /** The movie's page on its source's site, or `null` when it has none. */
  SiteUrl: string | null;
  Title: string | null;
  ReleaseDate: string | null;
};

export type MetadataOrderingTypeValues =
  | 'Default'
  | 'Unknown'
  | 'OriginalAirDate'
  | 'Absolute'
  | 'DVD'
  | 'Digital'
  | 'StoryArc'
  | 'Production'
  | 'TV'
  | 'User';

export type MetadataSeriesOrderingType = {
  /** The full ordering ID, e.g. `tmdb://ordering/…`. */
  ID: string;
  /** The source's own ID for the ordering. */
  LocalID: string;
  Source: string;
  Name: string;
  Type: MetadataOrderingTypeValues;
  IsDefault: boolean;
  /** Whether it is the one in use: the chosen one, or the default when none is. */
  IsPreferred: boolean;
  EpisodeCount: number;
  HiddenEpisodeCount: number;
  SeasonCount: number;
};

/** A metadata provider, from `GET Metadata/Provider`. */
export type MetadataProviderType = {
  ID: string;
  Name: string;
  Description: string;
  Version: string;
  /** The source the provider answers for, as routes take it. */
  Source: string;
  Plugin: PluginInfoType;
  PluginID: string;
  /** Whether the provider's source has an icon, served at `Metadata/Source/{source}/Icon`. */
  HasIcon: boolean;
  /** The provider's own configuration, saved through `Configuration/{id}`, if it has one. */
  Configuration: ConfigurationInfoType | null;
  SupportsSeries: boolean;
  SupportsMovies: boolean;
  SupportsCollections: boolean;
  SupportsImages: boolean;
  SupportsAutoLinking: boolean;
  SupportsLookup: boolean;
  SupportsPausing: boolean;
  /** The kinds of entries the provider can answer for, such as `Show`, `Movie` or `Episode`. */
  AvailableEntityTypes: string[];
  MaxConcurrentJobs: number | null;
  IsEnabled: boolean;
  /** The kinds of entries the provider is on for. */
  EnabledEntityTypes: string[];
  IsConfigured: boolean;
  NotConfiguredReason: string | null;
  /** Whether this is the provider that works out what an anime is for its source. */
  IsAutoLinker: boolean;
  /** Whether the source links new anime on its own. */
  AutoLink: boolean;
  /** Whether the source's automatic links may point at restricted entries. */
  AutoLinkRestricted: boolean;
  Status: MetadataSourceStatusType;
};

/** One provider's place in the order of a kind, from `GET Metadata/Source/{source}/Providers`. */
export type MetadataSourceProviderType = {
  ProviderID: string;
  Name: string;
  PluginID: string;
  /** The place in the order, from 0 for the first. */
  Priority: number;
  /** Whether it may answer, now or once those before it are off. */
  IsEnabled: boolean;
  /** Whether it is the one answering: the first enabled one. The other enabled ones stand by. */
  IsActive: boolean;
};

/** The providers claiming one kind of a source, in the order they are tried, from `GET Metadata/Source/{source}/Providers`. */
export type MetadataSourceProvidersType = {
  EntityType: string;
  Providers: MetadataSourceProviderType[];
};

/** What an import of a cross-reference file did, from `POST Metadata/{source}/CrossReferences/Import`. */
export type MetadataImportSummaryType = {
  LinkCount: number;
  MoviesAdded: number;
  MoviesUpdated: number;
  MoviesKept: number;
  MoviesRemoved: number;
  SeriesAdded: number;
  EpisodesAdded: number;
  EpisodesUpdated: number;
  EpisodesKept: number;
  EpisodesRemoved: number;
  RefreshesQueued: number;
};
