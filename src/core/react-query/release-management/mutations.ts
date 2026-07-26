import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ReleaseDeletionRequestType } from '@/core/react-query/release-management/types';

export const useReleaseDeleteMutation = () =>
  useMutation({
    mutationFn: (body: ReleaseDeletionRequestType) => axios.post('ReleaseManagement/Execute', body),
  });
