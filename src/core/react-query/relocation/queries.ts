import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  RelocationConfigurationType,
  RelocationPresetType,
  RelocationProviderType,
} from '@/core/types/api/relocation';

export const useRelocationProvidersQuery = (enabled = true) =>
  useQuery<RelocationProviderType[]>({
    queryKey: ['relocation', 'provider', 'all'],
    queryFn: () => axios.get('Relocation/Provider'),
    enabled,
  });

export const useRelocationProviderQuery = (id: string, enabled = true) =>
  useQuery<RelocationProviderType>({
    queryKey: ['relocation', 'provider', id],
    queryFn: () => axios.get(`Relocation/Provider/${id}`),
    enabled,
  });

export const useRelocationPresetsQuery = () =>
  useQuery<RelocationPresetType[]>({
    queryKey: ['relocation', 'preset', 'all'],
    queryFn: () => axios.get('Relocation/Preset'),
  });

export const useRelocationConfigurationQuery = (presetId: string, enabled = true) =>
  useQuery<RelocationConfigurationType>({
    queryKey: ['relocation', 'preset', presetId, 'configuration'],
    queryFn: () => axios.get(`Relocation/Preset/${presetId}/Configuration`),
    enabled,
  });
