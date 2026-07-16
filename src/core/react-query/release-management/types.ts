import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export type ReleaseManagementItemType = 'DuplicateFiles' | 'MissingEpisodes';

export type MultipleReleasesSeriesRequestType = {
  onlyFinishedSeries?: boolean;
  onlyWithRedundant?: boolean;
  includeVariations?: boolean;
  search?: string;
} & PaginationType;

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

export type SeriesCandidateOverride = {
  seriesID: number;
  preferredCandidateKey: string;
};

export type ReleaseMixMatchDeletionPreviewRequestType = {
  selectedPlaceIDs: number[];
};

export type ReleaseDeletionPreviewRequestType = {
  includedSeriesIDs?: number[];
  excludedSeriesIDs?: number[];
  overrides?: SeriesCandidateOverride[];
};

export type ReleaseDeletionRequestType = {
  placeIDs: number[];
};
