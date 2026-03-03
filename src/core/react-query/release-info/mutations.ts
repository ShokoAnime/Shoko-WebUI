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
  useMutation<void, unknown, UpdateReleaseInfoSettingsType>({
    mutationKey: ['release-info', 'settings'],
    mutationFn: settings => axios.post('/ReleaseInfo/Settings', settings),
    onSuccess: () => invalidateQueries(['release-info', 'summary']),
  });

export const useUpdateManyReleaseInfoProvidersMutation = () =>
  useMutation<void, unknown, UpdateManyReleaseInfoProviderType[]>({
    mutationKey: ['release-info', 'providers'],
    mutationFn: providers => axios.post('/ReleaseInfo/Provider', providers),
    onSuccess: () => invalidateQueries(['release-info', 'providers']),
  });

export const useUpdateReleaseInfoProviderMutation = (providerGuid: string) =>
  useMutation<void, unknown, UpdateOneReleaseInfoProviderType>({
    mutationKey: ['release-info', 'providers', providerGuid],
    mutationFn: provider => axios.put(`/ReleaseInfo/Provider/${providerGuid}`, provider),
    onSuccess: () => invalidateQueries(['release-info', 'providers']),
  });

export const useSubmitReleaseInfoForFileByIdMutation = () =>
  useMutation<void, unknown, { fileId: number, release: ReleaseInfoType }>({
    mutationFn: ({ fileId, release }) => axios.post(`/ReleaseInfo/File/${fileId}`, release),
  });

export const useAutoPreviewReleaseInfoForFileByIdMutation = () =>
  useMutation<ReleaseInfoType | null, unknown, { fileId: number, providerIDs?: string[] }>({
    mutationFn: ({ fileId, providerIDs = [] }) =>
      axios.post(`/ReleaseInfo/File/${fileId}/AutoPreview`, undefined, {
        params: { providerIDs },
      }),
  });
