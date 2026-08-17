/** Minimal image reference used for passing images around without full metadata. */
export type ImageLinkType = {
  UID: string;
  Available: boolean;
};

export type ImageType = ImageLinkType & {
  Source: DataSourceValues;
  Type: ImageEntityValues;
  ID: number;
  PrimaryUID: string;
  Preferred: boolean;
  Width?: number;
  Height?: number;
  Disabled: boolean;
};

export type ImagesType = {
  Posters: ImageType[];
  Backdrops: ImageType[];
  Banners: ImageType[];
  Logos: ImageType[];
  Discs: ImageType[];
};

export type EpisodeImagesType = ImagesType & {
  Thumbnails?: ImageType[];
};

export type ImageEntityValues = 'None' | 'Primary' | 'Backdrop' | 'Banner' | 'Logo' | 'Disc';

export type RatingType = {
  Value: number;
  MaxValue: number;
  Source: string;
  Votes: number;
  Type: 'Permanent' | 'Temporary';
};

export type LogLineType = {
  TimeStamp: string;
  Message: string;
  Level: string;
};

export type DataSourceValues =
  | 'Plugin'
  | 'LocallyGenerated'
  | 'None'
  | 'User'
  | 'Shoko'
  | 'AniDB'
  | 'TMDB'
  | 'TvDB'
  | 'AniList'
  | 'Animeshon'
  | 'Kitsu'
  | 'MAL'
  | 'FanartTV'
  | 'IMDB'
  | 'OMDB'
  | 'TraktTv'
  | 'TPDB'
  | 'MediUX'
  | 'SimKL';

export type DataSourceTypeValues = 'AniDB' | 'TMDB';
