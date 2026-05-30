import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

import type {
  ConfigurationWithSchemaResultType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';

export const useConfigurationGetAllQuery = () =>
  useQuery<ConfigurationInfoType[]>({
    queryKey: ['configuration', 'all'],
    queryFn: () => axios.get('Configuration?isBase=false'),
  });

export const useConfigurationJsonSchemaQuery = (configGuid: string, enabled = true) =>
  useQuery<ConfigurationWithSchemaResultType>({
    queryKey: ['configuration', 'object', configGuid],
    queryFn: async () => {
      const [config, info, schema] = await Promise.all([
        axios.get<unknown, unknown>(`Configuration/${configGuid}`),
        axios.get<unknown, ConfigurationInfoType>(`Configuration/${configGuid}/Info`),
        queryClient.ensureQueryData({
          queryKey: ['configuration', 'json-schema', configGuid],
          queryFn: () => axios.get<unknown, JSONSchema4WithUiDefinition>(`Configuration/${configGuid}/Schema`),
        }),
      ]);
      return { config, info, schema };
    },
    enabled,
  });
