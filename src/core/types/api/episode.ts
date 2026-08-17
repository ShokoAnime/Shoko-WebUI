import type { EpisodeImagesType, RatingType } from './common';
import type { FileType } from '@/core/types/api/file';
import type { TmdbEpisodeType, TmdbMovieType } from '@/core/types/api/tmdb';

export type EpisodeType = {
  IDs: EpisodeIDsType;
  Name: string;
  Description: string;
  Images: EpisodeImagesType;
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  Size: number;
  AniDB?: AniDBEpisodeType;
  TMDB?: {
    Episodes: TmdbEpisodeType[];
    Movies: TmdbMovieType[];
  };
  IsHidden: boolean;
  Files?: FileType[];
};

export type EpisodeIDsType = {
  ID: number;
  AniDB: number;
  TMDB: {
    Episode: number[];
    Movie: number[];
  };
  ParentSeries: number;
};

export type EpisodeTitleType = {
  Name: string;
  Language: string;
  Default: boolean;
  Source: string;
};

export type EpisodeTypeValues =
  | 'Unknown'
  | 'Other'
  | 'Episode'
  | 'Special'
  | 'Trailer'
  | 'Credits'
  | 'Parody';

export type AniDBEpisodeType = {
  ID: number;
  Type: EpisodeTypeValues;
  EpisodeNumber: number;
  AirDate: string | null;
  Title: string;
  Titles: EpisodeTitleType[];
  Description: string;
  Rating: RatingType;
};

export type MatchRatingValues =
  | 'DateAndTitleKindaMatches'
  | 'DateAndTitleMatches'
  | 'DateKindaMatches'
  | 'DateMatches'
  | 'FirstAvailable'
  | 'None'
  | 'TitleKindaMatches'
  | 'TitleMatches'
  | 'UserVerified';
