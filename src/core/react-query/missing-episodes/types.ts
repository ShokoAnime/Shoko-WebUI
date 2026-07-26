import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export type MissingEpisodesSeriesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceType[];
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type MissingEpisodesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeAbsolutePaths?: boolean;
  includeDataFrom?: DataSourceType[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
} & PaginationType;
