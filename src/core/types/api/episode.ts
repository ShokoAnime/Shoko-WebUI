import type { DataSourceType, EpisodeImagesType, RatingType } from './common';
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
  TvDB: number[];
  ParentSeries: number;
};

export type EpisodeTitleType = {
  Name: string;
  Language: string;
  Default: boolean;
  Source: string;
};

export const enum EpisodeTypeEnum {
  Unknown = 'Unknown',
  Other = 'Other',
  Normal = 'Normal',
  Special = 'Special',
  Trailer = 'Trailer',
  ThemeSong = 'ThemeSong',
  OpeningSong = 'OpeningSong',
  EndingSong = 'EndingSong',
  Parody = 'Parody',
  Interview = 'Interview',
  Extra = 'Extra',
}

export type AniDBEpisodeType = {
  ID: number;
  Type: EpisodeTypeEnum;
  EpisodeNumber: number;
  AirDate: string | null;
  Title: string;
  Titles: EpisodeTitleType[];
  Description: string;
  Rating: RatingType;
};

export type EpisodeFilesQueryType = {
  includeDataFrom?: DataSourceType[];
  includeXRefs?: boolean;
  isManuallyLinked?: boolean;
  includeMediaInfo?: boolean;
};

export enum MatchRatingType {
  UserVerified = 'UserVerified',
  DateAndTitleMatches = 'DateAndTitleMatches',
  DateMatches = 'DateMatches',
  TitleMatches = 'TitleMatches',
  FirstAvailable = 'FirstAvailable',
  None = 'None',
}
