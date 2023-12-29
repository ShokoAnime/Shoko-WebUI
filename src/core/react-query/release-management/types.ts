import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export type SeriesWithMultipleReleasesRequestType = {
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceType[];
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type SeriesEpisodesWithMultipleReleasesType = {
  includeDataFrom?: DataSourceType[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
  includeAbsolutePaths?: boolean;
  ignoreVariations?: boolean;
};
