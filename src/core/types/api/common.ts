export type ImageType = {
  Source: ImageSourceEnum;
  Type: ImageTypeEnum;
  ID: number;
  RelativeFilepath: null;
  Preferred: boolean;
  Width: null;
  Height: null;
  Disabled: boolean;
} | {
  Source: ImageSourceEnum;
  Type: ImageTypeEnum;
  ID: number;
  RelativeFilepath: string;
  Preferred: boolean;
  Width: number;
  Height: number;
  Disabled: boolean;
};

export type ImagesType = {
  Posters: ImageType[];
  Backdrops: ImageType[];
  Banners: ImageType[];
  Logos: ImageType[];
};

export type EpisodeImagesType = ImagesType & {
  Thumbnails: ImageType[];
};

export const enum ImageSourceEnum {
  AniDB = 'AniDB',
  TMDB = 'TMDB',
  Shoko = 'Shoko',
}

export const enum ImageTypeEnum {
  Poster = 'Poster',
  Banner = 'Banner',
  Thumb = 'Thumb',
  Backdrop = 'Backdrop',
  Character = 'Character',
  Staff = 'Staff',
  Static = 'Static',
}

export type RatingType = {
  Value: number;
  MaxValue: number;
  Source: string;
  Votes: number;
  Type: 'Permanent' | 'Temporary';
};

export type FilterType = {
  IDs: {
    ParentFilter: number;
    ID: number;
  };
  Locked: boolean;
  ApplyAtSeriesLevel: boolean;
  Directory: boolean;
  HideInAPI: boolean;
  Name: string;
  Size: number;
};

export type LogLineType = {
  TimeStamp: string;
  Message: string;
  Level: string;
};

export type DataSourceType = 'AniDB' | 'TMDB' | 'MAL' | 'AniList' | 'Animeshon' | 'Kitsu';
