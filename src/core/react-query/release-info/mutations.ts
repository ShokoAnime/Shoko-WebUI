import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  UpdateManyReleaseInfoProviderType,
  UpdateOneReleaseInfoProviderType,
  UpdateReleaseInfoSettingsType,
} from '@/core/react-query/release-info/types';
import type { ReleaseInfoType } from '@/core/types/api/file';

export const useUpdateReleaseInfoSettingsMutation = () =>
  useMutation({
    mutationKey: ['release-info', 'settings'],
    mutationFn: (settings: UpdateReleaseInfoSettingsType) => axios.post('/ReleaseInfo/Settings', settings),
    onSuccess: () => invalidateQueries(['release-info', 'summary']),
  });

export const useUpdateManyReleaseInfoProvidersMutation = () =>
  useMutation({
    mutationKey: ['release-info', 'providers'],
    mutationFn: (providers: UpdateManyReleaseInfoProviderType[]) => axios.post('/ReleaseInfo/Provider', providers),
    onSuccess: () => invalidateQueries(['release-info', 'providers']),
  });

export const useUpdateReleaseInfoProviderMutation = (providerGuid: string) =>
  useMutation({
    mutationKey: ['release-info', 'providers', providerGuid],
    mutationFn: (provider: UpdateOneReleaseInfoProviderType) =>
      axios.put(`/ReleaseInfo/Provider/${providerGuid}`, provider),
    onSuccess: () => invalidateQueries(['release-info', 'providers']),
  });

export const useAutoPreviewReleaseInfoForFileByIdMutation = () =>
  useMutation({
    mutationFn: ({ fileId, providerIDs = [] }: { fileId: number, providerIDs?: string[] }) =>
      axios.post<unknown, ReleaseInfoType | null>(`/ReleaseInfo/File/${fileId}/AutoPreview`, undefined, {
        params: { providerIDs },
      }),
  });
