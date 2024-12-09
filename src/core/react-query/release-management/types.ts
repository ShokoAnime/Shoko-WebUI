import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export type ReleaseManagementSeriesRequestType = {
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceType[];
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type ReleaseManagementSeriesEpisodesType = {
  includeDataFrom?: DataSourceType[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
  includeAbsolutePaths?: boolean;
  ignoreVariations?: boolean;
} & PaginationType;
