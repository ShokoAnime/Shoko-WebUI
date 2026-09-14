import type { ImageType, RatingType } from '@/core/types/api/common';
import type { MatchRatingValues } from '@/core/types/api/episode';

export type AnilistAnimeTypeValues =
  | 'Unknown'
  | 'TVSeries'
  | 'TVShort'
  | 'Movie'
  | 'OVA'
  | 'Web'
  | 'TVSpecial'
  | 'MusicVideo';

export type AnilistMediaStatusValues =
  | 'Unknown'
  | 'Finished'
  | 'Releasing'
  | 'NotYetReleased'
  | 'Cancelled'
  | 'Hiatus';

export type AnilistSeasonValues = 'Winter' | 'Spring' | 'Summer' | 'Fall';

/**
 * A partial date as serialized by the server. Only the year is guaranteed to
 * be present.
 */
export type AnilistPartialDateType = string;

export type AnilistRatingType = Omit<RatingType, 'Type'> & {
  Type: string;
};

export type AnilistTagType = {
  ID: number;
  Name: string;
  Description?: string | null;
  Rank: number;
  IsSpoiler: boolean;
};

export type AnilistStudioType = {
  ID: number;
  Name: string;
  CountryOfOrigin: string;
  Size: number;
  Logos: ImageType[];
  Source: string;
};

export type AnilistAnimeXrefType = {
  AnidbAnimeID: number;
  AnilistAnimeID: number;
  Rating: MatchRatingValues;
};

export type AnilistEpisodeXrefType = {
  AnidbAnimeID: number;
  AnidbEpisodeID: number;
  AnilistAnimeID: number;
  AnilistEpisodeID: number;
  EpisodeNumber: number;
  Index: number;
  Rating: MatchRatingValues;
};

export type AnilistAnimeType = {
  ID: number;
  Title: string;
  /** Transcribed canonical title; romaji for japanese anime, pinyin for chinese. */
  MainTitle: string;
  NativeTitle: string;
  Synonyms?: string[];
  Overview: string;
  OriginalLanguage: string;
  IsRestricted: boolean;
  UserRating: AnilistRatingType;
  MeanScore: number;
  Popularity: number;
  FavoriteCount: number;
  Type: AnilistAnimeTypeValues;
  Status: AnilistMediaStatusValues;
  Source: string;
  Season?: AnilistSeasonValues | null;
  SeasonYear?: number | null;
  EpisodeCount: number;
  EpisodeDuration?: number | null;
  Genres: string[];
  CoverImage?: string | null;
  BannerImage?: string | null;
  Color?: string | null;
  MalIDs?: number[];
  Tags?: AnilistTagType[];
  Studios?: AnilistStudioType[];
  CrossReferences?: AnilistAnimeXrefType[];
  StartedAt?: AnilistPartialDateType | null;
  EndedAt?: AnilistPartialDateType | null;
  CreatedAt: string;
  LastUpdatedAt: string;
};

export type AnilistEpisodeType = {
  ID: number;
  AnimeID: number;
  ScheduleID?: number | null;
  EpisodeNumber: number;
  Runtime: string;
  AiredAt?: string | null;
  CreatedAt: string;
  LastUpdatedAt: string;
  CrossReferences?: AnilistEpisodeXrefType[];
};

export type AnilistSearchResultType = {
  ID: number;
  Title: string;
  OriginalTitle: string;
  OriginalLanguage: string;
  Overview: string;
  IsRestricted: boolean;
  Type: AnilistAnimeTypeValues;
  FirstAiredAt?: AnilistPartialDateType | null;
  CoverImage?: string | null;
  BannerImage?: string | null;
  UserRating: AnilistRatingType;
};

export type AnilistAutoSearchResultType = {
  AnimeID: number;
  IsLocal: boolean;
  IsRemote: boolean;
  Anime: AnilistSearchResultType;
};
