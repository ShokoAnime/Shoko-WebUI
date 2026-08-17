import type { ImageType, ImagesType, RatingType } from './common';
import type { TmdbMovieType, TmdbShowType } from '@/core/types/api/tmdb';

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
  Description: string;
  AniDB?: AniDBSeriesType;
  TMDB?: {
    Movies: TmdbMovieType[];
    Shows: TmdbShowType[];
  };
};

export type ReleaseManagementSeriesType = {
  EpisodeCount: number;
} & SeriesType;

export type SeriesIDsType = {
  ID: number;
  ParentGroup: number;
  TopLevelGroup: number;
  AniDB: number;
  MAL: number[];
  TMDB: {
    Movie: number[];
    Show: number[];
  };
};

export type AniDBSeriesType = {
  ID: number;
  ShokoID?: number;
  Type: AnimeTypeValues;
  Restricted: boolean;
  Title: string;
  Titles: SeriesTitleType[];
  Description: string;
  AirDate: string | null;
  EndDate: string | null;
  Poster: ImageType;
  Rating: RatingType;
};

export type AnimeTypeValues =
  | 'Unknown'
  | 'Other'
  | 'TV'
  | 'TVSpecial'
  | 'Web'
  | 'Movie'
  | 'OVA'
  | 'MusicVideo';

export type RelationTypeValues =
  | 'Other'
  | 'SameSetting'
  | 'AlternativeSetting'
  | 'AlternativeVersion'
  | 'SharedCharacters'
  | 'Prequel'
  | 'MainStory'
  | 'FullStory'
  | 'Sequel'
  | 'SideStory'
  | 'Summary';

export type SeriesAniDBSearchResult = {
  ID: number;
  Title: string;
  Titles: SeriesTitleType[];
  ShokoID: number | null;
  Type: AnimeTypeValues;
  EpisodeCount: number;
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
  ManualLinks: number;
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
  Anime: AniDBSeriesType;
  SimilarTo: number;
};

export type SeriesAniDBRelatedType = {
  ID: number;
  ShokoID: number | null;
  Type: AnimeTypeValues;
  Title: string;
  Titles: SeriesTitleType[];
  Restricted: boolean;
  Poster: ImageType;
  EpisodeCount: number | null;
  Rating: RatingType;
  UserApproval: RatingType;
  Relation: RelationTypeValues;
};

export type SeriesAniDBSimilarType = {
  ID: number;
  ShokoID: number | null;
  Type: AnimeTypeValues;
  Title: string;
  Titles: SeriesTitleType[];
  Restricted: boolean;
  Poster: ImageType;
  EpisodeCount: number | null;
  Rating: RatingType;
  UserApproval: RatingType;
  Relation: RelationTypeValues;
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
  Character?: SeriesRolePerson;
  RoleName: string;
  RoleDetails: string;
};
