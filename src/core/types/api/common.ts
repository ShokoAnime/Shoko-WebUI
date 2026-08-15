/** Minimal image reference used for passing images around without full metadata. */
export type ImageLinkType = {
  UID: string;
  Available: boolean;
};

export type ImageType = ImageLinkType & {
  Source: ImageSourceType;
  Type: ImageEntityType;
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

export type ImageSourceType = 'AniDB' | 'TMDB' | 'Shoko' | 'User';

export type ImageEntityType = 'None' | 'Primary' | 'Backdrop' | 'Banner' | 'Logo' | 'Disc';

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

export type DataSourceType = 'AniDB' | 'TMDB' | 'MAL' | 'AniList' | 'Animeshon' | 'Kitsu';
