import type { PaginationType } from '@/core/types/api';
import type { DataSourceType, ImageType } from '@/core/types/api/common';

type SeriesEpisodesBaseRequestType = {
  includeMissing?: string;
  includeHidden?: string;
  includeWatched?: string;
  type?: string;
  search?: string;
  fuzzy?: boolean;
};

export type ChangeSeriesImageRequestType = {
  seriesId: number;
  image: ImageType;
};

export type DeleteSeriesRequestType = {
  seriesId: number;
  deleteFiles?: boolean;
  completelyRemove?: boolean;
};

export type SeriesRequestType = {
  includeDataFrom?: DataSourceType[];
  randomImages?: boolean;
};

export type SeriesAniDBEpisodesRequestType = SeriesEpisodesBaseRequestType & PaginationType;

export type SeriesEpisodesInfiniteRequestType =
  & {
    includeDataFrom?: DataSourceType[];
    includeFiles?: boolean;
    includeAbsolutePaths?: boolean;
    includeMediaInfo?: boolean;
  }
  & SeriesEpisodesBaseRequestType
  & PaginationType;

export type SeriesNextUpRequestType = {
  includeDataFrom?: DataSourceType[];
  includeMissing?: boolean;
  onlyUnwatched?: boolean;
};

export type SeriesTagsRequestType = {
  filter?: number;
  excludeDescriptions?: boolean;
};

export type RefreshAniDBSeriesRequestType = {
  anidbID: number;
  force?: boolean;
  createSeriesEntry?: boolean;
  immediate?: boolean;
};

export type RefreshSeriesAniDBInfoRequestType = {
  seriesId: number;
  force?: boolean;
  cacheOnly?: boolean;
};

export type RefreshSeriesTvdbInfoRequestType = {
  seriesId: number;
  force?: boolean;
};

export type WatchSeriesEpisodesRequestType = {
  seriesId: number;
  value: boolean;
} & SeriesEpisodesBaseRequestType;
