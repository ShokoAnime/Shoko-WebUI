import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export enum ReleaseManagementItemType {
  MultipleReleases = 'MultipleReleases',
  DuplicateFiles = 'DuplicateFiles',
  MissingEpisodes = 'MissingEpisodes',
}

export type ReleaseManagementSeriesRequestType = {
  ignoreVariations?: boolean;
  includeDataFrom?: DataSourceType[];
  collecting?: boolean;
  onlyFinishedSeries?: boolean;
} & PaginationType;

export type ReleaseManagementSeriesEpisodesType = {
  includeDataFrom?: DataSourceType[];
  includeFiles?: boolean;
  includeMediaInfo?: boolean;
  includeAbsolutePaths?: boolean;
  collecting?: boolean;
  ignoreVariations?: boolean;
} & PaginationType;
