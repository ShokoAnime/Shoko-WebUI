import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';
import type { EpisodeTypeEnum } from '@/core/types/api/episode';

export enum IncludeOnlyFilterEnum {
  true = 'true',
  false = 'false',
  only = 'only',
}

type SeriesEpisodesBaseRequestType = {
  includeMissing?: IncludeOnlyFilterEnum;
  includeHidden?: IncludeOnlyFilterEnum;
  includeWatched?: IncludeOnlyFilterEnum;
  includeUnaired?: IncludeOnlyFilterEnum;
  type?: EpisodeTypeEnum[];
  search?: string;
  fuzzy?: boolean;
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
    includeManuallyLinked?: IncludeOnlyFilterEnum;
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

export type WatchSeriesEpisodesRequestType = {
  value: boolean;
} & SeriesEpisodesBaseRequestType;
