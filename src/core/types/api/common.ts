
export type ImageType = {
  Source: ImageSourceEnum;
  Type: ImageTypeEnum;
  ID: string;
  RelativeFilepath: null;
  Preferred: boolean;
  Width: null;
  Height: null;
  Disabled: boolean;
} | {
  Source: ImageSourceEnum;
  Type: ImageTypeEnum;
  ID: string;
  RelativeFilepath: string;
  Preferred: boolean;
  Width: number;
  Height: number;
  Disabled: boolean;

};

export type ImagesType = {
  Posters: ImageType[];
  Fanarts: ImageType[];
  Banners: ImageType[];
};

export const enum ImageSourceEnum {
  AniDB = 'AniDB',

  TvDB = 'TvDB',

  TMDB = 'TMDB',

  Shoko = 'Shoko',
}

export const enum ImageTypeEnum {
  Poster = 'Poster',

  Banner = 'Banner',

  Thumb = 'Thumb',

  Fanart = 'Fanart',

  Character = 'Character',

  Staff = 'Staff',
  Static = 'Static',
}

export type SizesType = {
  Local: SizesEpisodeCountsType;
  Watched: SizesEpisodeCountsType;
  Total: SizesEpisodeCountsType;
};

export type SizesEpisodeCountsType = {
  Episodes: number;
  Specials: number;
  Credits: number;
  Trailers: number;
  Parodies: number;
  Others: number;
};

export type RatingType = {
  Value: number;
  MaxValue: number;
  Source: string;
  Votes: number;
  Type: string | null;
};
