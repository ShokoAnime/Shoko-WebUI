import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';

import type { ReleaseInfoSettingsType, UpdateReleaseInfoProvidersType } from '@/core/react-query/release-info/types';
import type { ReleaseInfoType } from '@/core/types/api/file';

export const useUpdateReleaseInfoSettingsMutation = () =>
  useMutation({
    mutationFn: (settings: ReleaseInfoSettingsType) => axios.post('/ReleaseInfo/Settings', settings),
    onSuccess: () => invalidateQueries(['release-info', 'summary']),
  });

export const useUpdateReleaseInfoProvidersMutation = () =>
  useMutation({
    mutationFn: (providers: UpdateReleaseInfoProvidersType[]) => axios.post('/ReleaseInfo/Provider', providers),
    onSuccess: (_, providers) => {
      queryClient.setQueryData(['release-info', 'providers'], providers);
      invalidateQueries(['release-info', 'providers']);
    },
  });

export const useSubmitReleaseInfoForFileByIdMutation = () =>
  useMutation({
    mutationFn: ({ fileId, release }: { fileId: number, release: ReleaseInfoType }) =>
      axios.post(`/ReleaseInfo/File/${fileId}`, release),
  });

export const useAutoPreviewReleaseInfoForFileByIdMutation = () =>
  useMutation<ReleaseInfoType | null, unknown, { fileId: number, providerIDs?: string[] }>({
    mutationFn: ({ fileId, providerIDs = [] }) =>
      axios.post(`/ReleaseInfo/File/${fileId}/AutoPreview`, undefined, {
        params: { providerIDs },
      }),
    scope: {
      id: 'release-info',
    },
  });

export const usePreviewReleaseInfoByProviderIdMutation = () =>
  useMutation<ReleaseInfoType, unknown, { id: string, providerId: string }>({
    mutationFn: ({ id, providerId }) =>
      axios.get(`/ReleaseInfo/Provider/${providerId}/Preview/By-Release`, { params: { id } }),
    scope: {
      id: 'release-info',
    },
  });
