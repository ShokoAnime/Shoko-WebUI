import type { PaginationType } from '@/core/types/api';

export type ReleaseManagementSeriesRequestType = {
  onlyFinishedSeries?: boolean;
  onlyWithRedundant?: boolean;
  includeVariations?: boolean;
  search?: string;
} & PaginationType;

export type ReleaseMixMatchDeletionPreviewRequestType = {
  selectedPlaceIDs: number[];
};

export type ReleaseDeletionPreviewRequestType = {
  includedSeriesIDs?: number[];
  excludedSeriesIDs?: number[];
  overrides?: {
    seriesID: number;
    preferredCandidateKey: string;
  }[];
};

export type ReleaseDeletionRequestType = {
  placeIDs: number[];
};
