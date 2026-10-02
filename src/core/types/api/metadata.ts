import type { MatchRatingValues } from '@/core/types/api/episode';

/** A source series or movies can be linked to, from `GET Metadata/Source`. */
export type MetadataLinkSourceType = {
  /** The source, as routes take it (e.g. `TMDB`). */
  Source: string;
  Name: string;
  /** The plugin of the source's first registered provider. */
  PluginID: string;
  /** Whether the source has an icon, served at `Metadata/Source/{source}/Icon`. */
  HasIcon: boolean;
  SupportsSeries: boolean;
  SupportsMovies: boolean;
  IsSeriesEnabled: boolean;
  IsMovieEnabled: boolean;
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

export type MetadataAutoSearchOriginType =
  | 'Search'
  | 'CurrentLink'
  | 'PrequelLink'
  | 'AnidbResource'
  | 'CrossSourceLink';

export type MetadataAutoSearchRejectionType = {
  /** The server's `MatchRejectionReason`, such as `Outranked` or `TitleMismatch`. */
  Reason: string;
  /** Anything more worth showing about it, if anything. */
  Details: string | null;
};

export type MetadataAutoSearchResultType = {
  ID: string;
  /** Where the match came from. */
  Origin: MetadataAutoSearchOriginType;
  /** Why an automatic search would not link it, or `null` when it would. */
  Rejection: MetadataAutoSearchRejectionType | null;
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
