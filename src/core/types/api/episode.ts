import { ImageType, RatingType } from './common';

export type EpisodeType = {
  IDs: EpisodeIDsType;
  Name: string;
  Duration: string;
  ResumePosition: string | null;
  Watched: string | null;
  Size: number;
};

export type EpisodeIDsType = {
  ID: number;
  AniDB: number;
  TvDB: number[];
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

export type EpisodeAniDBType = {
  ID: number;
  Type: EpisodeTypeEnum;
  EpisodeNumber: number;
  AirDate: string | null;
  Titles: EpisodeTitleType[];
  Description: string;
  Rating: RatingType;
};

export type EpisodeTvDBType = {
  ID: number;
  Season: number;
  Number: number;
  AbsoluteNumber: number;
  Title: string;
  Description: string;
  AirDate: string | null;
  AirsAfterSeason: number;
  AirsBeforeSeason:  number;
  AirsBeforeEpisode: number;
  Rating: RatingType;
  Thumbnail: ImageType;
};