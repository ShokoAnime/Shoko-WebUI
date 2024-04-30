import type { ImageType, ImagesType, RatingType } from './common';

export type SeriesDetailsType = SeriesType & {
  AniDB?: SeriesAniDBType;
};

export type SeriesType = {
  IDs: SeriesIDsType;
  Name: string;
  Size: number;
  Sizes: SeriesSizesType;
  Images: ImagesType;
  UserRating: RatingType;
  Links: SeriesLinkType[];
  Created: string;
  Updated: string;
  AniDB?: SeriesAniDBType;
};

export type SeriesWithMultipleReleasesType = {
  EpisodeCount: number;
} & SeriesType;

export type SeriesRelationType = {
  IDs: SeriesRelationIDsType;
  RelatedIDs: SeriesRelationIDsType;
  Type: SeriesRelationTypeEnum;
  Source: string;
};

export type SeriesRelationIDsType = {
  Shoko: number | null;
  AniDB: number | null;
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

export const enum SeriesRelationTypeEnum {
  Other = 'Other',
  SameSetting = 'SameSetting',
  AlternativeSetting = 'AlternativeSetting',
  AlternativeVersion = 'AlternativeVersion',
  SharedCharacters = 'SharedCharacters',
  Prequel = 'Prequel',
  MainStory = 'MainStory',
  FullStory = 'FullStory',
  Sequel = 'Sequel',
  SideStory = 'SideStory',
  Summary = 'Summary',
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
  Type: SeriesTypeEnum;
  EpisodeCount: number;
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

export type SeriesLinkType = {
  Type: string;
  Name: string;
  URL: string;
};

export type SeriesSizesType = {
  FileSources: SeriesSizesFileSourcesType;
  Local: SeriesSizesEpisodeCountsType;
  Watched: SeriesSizesEpisodeCountsType;
  Total: SeriesSizesEpisodeCountsType;
  Missing: SeriesSizesReducedEpisodeCountsType;
};

export type SeriesSizesFileSourcesType = {
  Unknown: number;
  Other: number;
  TV: number;
  DVD: number;
  BluRay: number;
  Web: number;
  VHS: number;
  VCD: number;
  LaserDisc: number;
  Camera: number;
};

export type SeriesSizesEpisodeCountsType = {
  Episodes: number;
  Specials: number;
  Credits: number;
  Trailers: number;
  Parodies: number;
  Others: number;
};

export type SeriesSizesReducedEpisodeCountsType = {
  Episodes: number;
  Specials: number;
};

export type SeriesRecommendedType = {
  Anime: SeriesAniDBType;
  SimilarTo: number;
};

export type SeriesAniDBRelatedType = {
  ID: number;
  ShokoID: number | null;
  Type: SeriesTypeEnum;
  Title: string;
  Titles: SeriesTitleType[];
  Restricted: boolean;
  Poster: ImageType;
  EpisodeCount: number | null;
  Rating: RatingType;
  UserApproval: RatingType;
  Relation: SeriesRelationTypeEnum;
};

export type SeriesAniDBSimilarType = {
  ID: number;
  ShokoID: number | null;
  Type: SeriesTypeEnum;
  Title: string;
  Titles: SeriesTitleType[];
  Restricted: boolean;
  Poster: ImageType;
  EpisodeCount: number | null;
  Rating: RatingType;
  UserApproval: RatingType;
  Relation: SeriesRelationTypeEnum;
};

export type SeriesRolePerson = {
  Name: string;
  AlternateName: string | null;
  Description: string | null;
  Image: ImageType;
};

export type SeriesCast = {
  Language: string;
  Staff: SeriesRolePerson;
  Character: SeriesRolePerson;
  RoleName: string;
  RoleDetails: string;
};

export type SeriesImagesType = {
  Posters: ImageType[];
  Banners: ImageType[];
  Fanarts: ImageType[];
};
