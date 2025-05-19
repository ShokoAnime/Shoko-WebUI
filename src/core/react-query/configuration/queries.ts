import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  ConfigurationWithSchemaResultType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';

export const useConfigurationGetAllQuery = () =>
  useQuery<ConfigurationInfoType[]>({
    queryKey: ['configuration', 'all'],
    queryFn: () => axios.get('Configuration'),
  });

export const useConfigurationJsonSchemaQuery = (configGuid: string, enabled = true) =>
  useQuery<ConfigurationWithSchemaResultType>({
    queryKey: ['configuration', configGuid, 'json-schema'],
    queryFn: async () => ({
      config: await axios.get<unknown, unknown>(`Configuration/${configGuid}`),
      info: await axios.get<unknown, ConfigurationInfoType>(`Configuration/${configGuid}/Info`),
      schema: await axios.get<unknown, JSONSchema4WithUiDefinition>(`Configuration/${configGuid}/Schema`),
    }),
    enabled,
  });
