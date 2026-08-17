import type { IncludeOnlyFilterType } from '@/core/react-query/types';
import type { PaginationType } from '@/core/types/api';
import type { DataSourceTypeValues, ImageEntityValues } from '@/core/types/api/common';
import type { EpisodeTypeValues } from '@/core/types/api/episode';

type SeriesEpisodesBaseRequestType = {
  includeMissing?: IncludeOnlyFilterType;
  includeHidden?: IncludeOnlyFilterType;
  includeWatched?: IncludeOnlyFilterType;
  includeUnaired?: IncludeOnlyFilterType;
  type?: EpisodeTypeValues[];
  search?: string;
  fuzzy?: boolean;
};

export type DeleteSeriesRequestType = {
  seriesId: number;
  deleteFiles?: boolean;
  completelyRemove?: boolean;
};

export type SeriesRequestType = {
  includeDataFrom?: DataSourceTypeValues[];
  randomImages?: boolean;
};

export type SeriesAniDBEpisodesRequestType = SeriesEpisodesBaseRequestType & PaginationType;

export type SeriesEpisodesInfiniteRequestType =
  & {
    includeDataFrom?: DataSourceTypeValues[];
    includeFiles?: boolean;
    includeAbsolutePaths?: boolean;
    includeMediaInfo?: boolean;
    includeManuallyLinked?: IncludeOnlyFilterType;
  }
  & SeriesEpisodesBaseRequestType
  & PaginationType;

export type SeriesNextUpRequestType = {
  includeDataFrom?: DataSourceTypeValues[];
  includeMissing?: boolean;
  onlyUnwatched?: boolean;
};

export type SeriesTagsRequestType = {
  filter?: number;
  excludeDescriptions?: boolean;
};

export type SeriesWithLinkedFilesRequestType = {
  search?: string;
  fuzzy?: boolean;
} & PaginationType;

export type SeriesWithoutFilesRequestType = SeriesWithLinkedFilesRequestType;

export type RefreshAniDBSeriesRequestType = {
  anidbID: number;
  force?: boolean;
  createSeriesEntry?: boolean;
  immediate?: boolean;
};

export type RefreshSeriesAniDBInfoRequestType = {
  force?: boolean;
  cacheOnly?: boolean;
};

export type UploadSeriesImageRequestType = {
  file: File;
  imageType: ImageEntityValues;
  seriesId: number;
};

export type WatchSeriesEpisodesRequestType = {
  value: boolean;
} & SeriesEpisodesBaseRequestType;

export type SeriesImagesRequestType = {
  includeDisabled?: boolean;
  includeUndesired?: boolean;
  showLinkedIDs?: boolean;
} & PaginationType;
