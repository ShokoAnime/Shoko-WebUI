import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { resetQueries } from '@/core/react-query/queryClient';

import type { ReleaseDeletionPreviewType } from '@/core/types/api/release-management';

type ReleaseOverrideBody = {
  selectedPlaceIDs: number[];
};

type SeriesCandidateOverride = {
  seriesID: number;
  preferredCandidateKey: string;
};

type ReleaseDeletionPreviewBody = {
  includedSeriesIDs?: number[];
  excludedSeriesIDs?: number[];
  overrides?: SeriesCandidateOverride[];
};

type DeleteReleasesBody = {
  placeIDs: number[];
};

export const useReleaseDeletionPreviewMutation = () =>
  useMutation({
    mutationFn: (body: ReleaseDeletionPreviewBody): Promise<ReleaseDeletionPreviewType[]> =>
      axios.post('ReleaseManagement/MultipleReleases/Preview', body),
  });

export const useReleaseOverrideMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (body: ReleaseOverrideBody): Promise<ReleaseDeletionPreviewType> =>
      axios.post(`ReleaseManagement/MultipleReleases/Series/${seriesId}/Override`, body),
  });

export const useReleaseExecuteMutation = () =>
  useMutation({
    mutationFn: (body: DeleteReleasesBody) => axios.post('ReleaseManagement/MultipleReleases/Execute', body),
    onSuccess: () => {
      resetQueries(['release-management']);
    },
  });
