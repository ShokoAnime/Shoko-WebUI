import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type {
  ConfigurationWithSchemaResultType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';
import type { RelocationSummaryResponseType } from '@/core/react-query/renamer/types';
import type { RelocationPipeType, RelocationProviderInfoType } from '@/core/types/api/renamer';

export const useRelocationSummaryQuery = (enabled = true) =>
  useQuery<RelocationSummaryResponseType>({
    queryKey: ['relocation', 'summary'],
    queryFn: () => axios.get('Relocation/Summary'),
    enabled,
  });

export const useRelocationProvidersQuery = (enabled = true) =>
  useQuery<RelocationProviderInfoType[]>({
    queryKey: ['relocation', 'all'],
    queryFn: () => axios.get('Relocation/Provider'),
    enabled,
  });

export const useRelocationPipesQuery = (enabled = true) =>
  useQuery<RelocationPipeType[], unknown, RelocationPipeType[]>({
    queryKey: ['relocation', 'pipe', 'all'],
    queryFn: async () => {
      const [pipes, providers] = await Promise.all([
        axios.get<unknown, Omit<RelocationPipeType, 'Provider'>[]>('Relocation/Pipe'),
        queryClient.ensureQueryData({
          queryKey: ['relocation', 'all'],
          queryFn: () => axios.get<unknown, RelocationProviderInfoType[]>('Relocation/Provider'),
        })
          .then(response => Object.fromEntries(response.map(provider => [provider.ID, provider]))),
      ]);
      const pipesWithProviders = pipes.map((pipe): RelocationPipeType => ({
        ...pipe,
        Provider: providers[pipe.ProviderID] || null,
      }));
      for (const pipe of pipesWithProviders) {
        queryClient.setQueryData(['relocation', 'pipe', pipe.ID], pipe.Provider);
      }
      return pipesWithProviders;
    },
    enabled,
  });

export const useRelocationPipeQuery = (pipeID: string, enabled = true) =>
  useQuery<RelocationPipeType>({
    queryKey: ['relocation', 'pipe', pipeID],
    queryFn: async () => {
      const [pipe, Provider] = await Promise.all([
        axios.get<unknown, Omit<RelocationPipeType, 'Provider'>>(`Relocation/Pipe/${pipeID}`),
        queryClient.ensureQueryData({
          queryKey: ['relocation', 'pipe', pipeID, 'provider'],
          queryFn: () =>
            axios.get<unknown, RelocationProviderInfoType>(`Relocation/Pipe/${pipeID}/Provider`)
              .catch(() => null),
        }),
      ]);
      return { ...pipe, Provider };
    },
    enabled,
  });

export const useRelocationPipeConfigurationJsonSchemaQuery = (pipeID?: string) =>
  useQuery<ConfigurationWithSchemaResultType | null>({
    queryKey: ['relocation', 'pipe', pipeID, 'configuration'],
    queryFn: async () => {
      if (!pipeID) return null;
      const provider = await queryClient.ensureQueryData({
        queryKey: ['relocation', 'pipe', pipeID, 'provider'],
        queryFn: () => axios.get<unknown, RelocationProviderInfoType>(`Relocation/Pipe/${pipeID}/Provider`),
      });
      if (provider?.Configuration == null) return null;
      const configID = provider.Configuration.ID;
      const [config, info, schema] = await Promise.all([
        axios.get<unknown, unknown>(`Relocation/Pipe/${pipeID}/Configuration`),
        provider.Configuration,
        queryClient.ensureQueryData({
          queryKey: ['configuration', 'json-schema', configID],
          queryFn: () => axios.get<unknown, JSONSchema4WithUiDefinition>(`Configuration/${configID}/Schema`),
        }),
      ]);
      return { config, info, schema };
    },
    initialData: () => null,
    initialDataUpdatedAt: 0,
  });
