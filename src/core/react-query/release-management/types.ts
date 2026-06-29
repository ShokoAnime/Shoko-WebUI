import type { PaginationType } from '@/core/types/api';
import type { DataSourceType } from '@/core/types/api/common';

export type ReleaseManagementItemType = 'MultipleReleases' | 'DuplicateFiles' | 'MissingEpisodes';

export type MultipleReleasesSeriesRequestType = {
  onlyFinishedSeries?: boolean;
  onlyWithRedundant?: boolean;
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

export type ReleaseOverrideBody = {
  selectedPlaceIDs: number[];
};

export type ReleaseDeletionPreviewBody = {
  includedSeriesIDs?: number[];
  excludedSeriesIDs?: number[];
  overrides?: SeriesCandidateOverride[];
};

export type DeleteReleasesBody = {
  placeIDs: number[];
};
