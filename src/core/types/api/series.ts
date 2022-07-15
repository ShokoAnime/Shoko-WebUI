import { ImageType, ImagesType, RatingType, SizesType } from './common';

export type SeriesType = {
  IDs: SeriesIDsType;
  Name: string;
  Size: number;
  Sizes: SizesType;
  Images: ImagesType;
  UserRating: RatingType;
  Links: Array<SeriesResourceType>;
  Created: string;
  Updated: string;
};

export type SeriesSearchResult = SeriesType & {
  Match: string;
  Distance: number;
};

export type SeriesIDsType = {
  ID: number;
  ParentGroup: number;
  TopLevelGroup: number;
  AniDB: number;
  TvDB: number[];
  TMDB: number[];
  MAL: number[];
  TraktTv: number[];
  AniList: number[];
};

export type SeriesAniDBType = {
  ID: number;
  Type: SeriesTypeEnum;
  Restricted: boolean;
  Title: string;
  Titles: SeriesTitleType[];
  Description: string;
  AirDate: string | null;
  EndDate: string | null;
  Poster: ImageType;
  Rating: RatingType;
};

export const enum SeriesTypeEnum {
  Unknown = 'Unknown',
  Other = 'Other',
  TV = 'TV',
  TVSpecial = 'TVSpecial',
  Web = 'Web',
  Movie = 'Movie',
  OVA = 'OVA',
}

export type SeriesAniDBRecommendedForYou = {
  Anime: SeriesAniDBType;
  SimilarTo: number;
};

export type SeriesAniDBSearchResult = {
  ID: number;
  Title: string;
  Titles: SeriesTitleType[];
  ShokoID: number | null;
};

export type SeriesTvDBType = {
  ID: number;
  AirDate: string | null;
  EndDate: string | null;
  Title: string;
  Description: string;
  Season: number | null;
  Posters: ImageType[];
  Fanarts: ImageType[];
  Banners: ImageType[];
  Rating: RatingType;
};

export type SeriesTitleType = {
  Name: string;
  Language: string;
  Default: boolean;
  Source: string;
  Type: string;
};

export type SeriesResourceType = {
  name: string;
  url: string;
  image: ImageType | null;
};
