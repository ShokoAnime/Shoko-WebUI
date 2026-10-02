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

export type TmdbAutoSearchOriginValues = 'Search' | 'CurrentLink' | 'PrequelLink' | 'AnidbResource' | 'CrossSourceLink';

/** The server's `MatchRejectionReason`. A reason the WebUI does not know yet is shown by name. */
export type TmdbAutoSearchRejectionReasonValues =
  | 'Outranked'
  | 'TitleMismatch'
  | 'DateMismatch'
  | 'EpisodeCountMismatch'
  | 'TypeMismatch'
  | 'Restricted'
  | 'ClaimedElsewhere'
  | 'KindDisabled'
  | 'InvalidID'
  | 'ExistingLink'
  | 'HintNotNeeded'
  | 'Other'
  | (string & {});

export type TmdbAutoSearchRejectionType = {
  Reason: TmdbAutoSearchRejectionReasonValues;
  /** Anything more worth showing about it, if anything. */
  Details: string | null;
};

export type TmdbAutoSearchResultType = {
  IsMovie: boolean;
  Show: TmdbSearchResultType;
  Movie: TmdbSearchResultType;
  /** Where the match came from. */
  Origin: TmdbAutoSearchOriginValues;
  /** Why an automatic search would not link it, or `null` when it would. */
  Rejection: TmdbAutoSearchRejectionType | null;
};
