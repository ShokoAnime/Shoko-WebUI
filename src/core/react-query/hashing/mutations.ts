import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  UpdateHashingSettingsType,
  UpdateManyHashingProviderInfoType,
  UpdateOneHashingProviderInfoType,
} from '@/core/react-query/hashing/types';

export const useUpdateHashingSettingsMutation = () =>
  useMutation<void, unknown, UpdateHashingSettingsType>({
    mutationKey: ['hashing', 'settings'],
    mutationFn: settings => axios.post('/Hashing/Settings', settings),
    onSuccess: () => invalidateQueries(['hashing', 'summary']),
  });

export const useUpdateManyHashingProvidersMutation = () =>
  useMutation<void, unknown, UpdateManyHashingProviderInfoType[]>({
    mutationKey: ['hashing', 'providers'],
    mutationFn: providers => axios.post('/Hashing/Provider', providers),
    onSuccess: () => invalidateQueries(['hashing', 'providers']),
  });

export const useUpdateHashingProviderMutation = (providerGuid: string) =>
  useMutation<void, unknown, UpdateOneHashingProviderInfoType>({
    mutationKey: ['hashing', 'providers', providerGuid],
    mutationFn: provider => axios.put(`/Hashing/Provider/${providerGuid}`, provider),
    onSuccess: () => invalidateQueries(['hashing', 'providers']),
  });
