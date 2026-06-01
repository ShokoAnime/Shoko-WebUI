import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { FormSchemaType } from '@/core/types/api/configuration';

export const useConfigurationSchemaQuery = (id: string) =>
  useQuery<FormSchemaType>({
    queryFn: () => axios.get(`Configuration/${id}/Schema`),
    queryKey: ['configuration', id, 'schema'],
  });

export const useConfigurationQuery = (id: string) =>
  useQuery<Record<string, unknown>>({
    queryFn: () => axios.get(`Configuration/${id}`),
    queryKey: ['configuration', id],
  });
