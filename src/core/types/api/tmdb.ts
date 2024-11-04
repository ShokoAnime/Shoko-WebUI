import type { MatchRatingType } from '@/core/types/api/episode';

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
  Rating: MatchRatingType;
} & TmdbXrefType;

export type TmdbMovieXrefType = {
  TmdbMovieID: number;
} & TmdbXrefType;

export type TmdbSearchResultType = {
  ID: number;
  Title: string;
};

export type TmdbAutoSearchResultType = {
  IsMovie: boolean;
  Show: TmdbSearchResultType;
  Movie: TmdbSearchResultType;
};
