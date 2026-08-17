import type { PaginationType } from '@/core/types/api';
import type { DataSourceTypeValues } from '@/core/types/api/common';

export type MissingEpisodesSeriesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceTypeValues[];
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type MissingEpisodesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeAbsolutePaths?: boolean;
  includeDataFrom?: DataSourceTypeValues[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
} & PaginationType;
