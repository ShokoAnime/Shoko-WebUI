import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  UpdateHashingSettingsType,
  UpdateManyHashingProviderInfoType,
  UpdateOneHashingProviderInfoType,
} from '@/core/react-query/hashing/types';

export const useUpdateHashingSettingsMutation = () =>
  useMutation({
    mutationKey: ['hashing', 'settings'],
    mutationFn: (settings: UpdateHashingSettingsType) => axios.post('/Hashing/Settings', settings),
    onSuccess: () => invalidateQueries(['hashing', 'summary']),
  });

export const useUpdateManyHashingProvidersMutation = () =>
  useMutation({
    mutationKey: ['hashing', 'providers'],
    mutationFn: (providers: UpdateManyHashingProviderInfoType[]) => axios.post('/Hashing/Provider', providers),
    onSuccess: () => invalidateQueries(['hashing', 'providers']),
  });

export const useUpdateHashingProviderMutation = (providerGuid: string) =>
  useMutation({
    mutationKey: ['hashing', 'providers', providerGuid],
    mutationFn: (provider: UpdateOneHashingProviderInfoType) =>
      axios.put(`/Hashing/Provider/${providerGuid}`, provider),
    onSuccess: () => invalidateQueries(['hashing', 'providers']),
  });
