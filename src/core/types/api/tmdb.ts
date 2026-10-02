import type { MatchRatingValues } from '@/core/types/api/episode';

export type TmdbEpisodeType = {
  ID: number;
  SeasonID: string;
  ShowID: number;
  Title: string;
  Overview: string;
  EpisodeNumber: number;
  SeasonNumber: number;
  AiredAt: string;
};

export type TmdbBaseItemType = {
  ID: number;
  Title: string;
  Overview: string;
  ReleasedAt: string;
};

export type TmdbMovieType = TmdbBaseItemType;

export type TmdbShowType = TmdbBaseItemType;

export type TmdbXrefType = {
  AnidbAnimeID: number;
  AnidbEpisodeID: number;
};

export type TmdbEpisodeXrefType = {
  TmdbShowID: number;
  TmdbEpisodeID: number;
  Index: number;
  Rating: MatchRatingValues;
} & TmdbXrefType;

export type TmdbMovieXrefType = {
  TmdbMovieID: number;
} & TmdbXrefType;

export type TmdbSearchResultType = {
  ID: number;
  Title: string;
};

export type TmdbAutoSearchOriginType = 'Search' | 'CurrentLink' | 'PrequelLink' | 'AnidbResource' | 'CrossSourceLink';

export type TmdbAutoSearchRejectionType = {
  /** The server's `MatchRejectionReason`, such as `Outranked` or `TitleMismatch`. */
  Reason: string;
  /** Anything more worth showing about it, if anything. */
  Details: string | null;
};

export type TmdbAutoSearchResultType = {
  IsMovie: boolean;
  Show: TmdbSearchResultType;
  Movie: TmdbSearchResultType;
  /** Where the match came from. */
  Origin: TmdbAutoSearchOriginType;
  /** Why an automatic search would not link it, or `null` when it would. */
  Rejection: TmdbAutoSearchRejectionType | null;
};
