import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  DeleteReleasesBody,
  ReleaseDeletionPreviewBody,
  ReleaseOverrideBody,
} from '@/core/react-query/release-management/types';
import type { ReleaseDeletionPreviewType } from '@/core/types/api/release-management';

export const useReleaseDeletionPreviewMutation = () =>
  useMutation<
    ReleaseDeletionPreviewType[],
    unknown,
    { body: ReleaseDeletionPreviewBody, onlyFinishedSeries?: boolean }
  >({
    mutationFn: ({ body, onlyFinishedSeries }) =>
      axios.post('ReleaseManagement/MultipleReleases/Preview', body, { params: { onlyFinishedSeries } }),
  });

export const useReleaseOverrideMutation = (seriesId: number) =>
  useMutation<ReleaseDeletionPreviewType, unknown, ReleaseOverrideBody>({
    mutationFn: body => axios.post(`ReleaseManagement/MultipleReleases/Series/${seriesId}/Override`, body),
  });

export const useReleaseExecuteMutation = () =>
  useMutation({
    mutationFn: (body: DeleteReleasesBody) => axios.post('ReleaseManagement/MultipleReleases/Execute', body),
  });
