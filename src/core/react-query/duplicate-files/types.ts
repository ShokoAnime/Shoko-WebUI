import type { PaginationType } from '@/core/types/api';
import type { DataSourceTypeValues } from '@/core/types/api/common';

export type DuplicateFilesSeriesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceTypeValues[];
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type DuplicateFilesEpisodesRequestType = {
  collecting?: boolean;
  ignoreVariations?: boolean;
  includeAbsolutePaths?: boolean;
  includeDataFrom?: DataSourceTypeValues[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
} & PaginationType;
