import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { resolveSchemaRefs } from '@/core/react-query/configuration/helpers';

import type { FormSchemaType } from '@/core/types/api/configuration';

export const useConfigurationSchemaQuery = (id: string) =>
  useQuery<FormSchemaType>({
    queryFn: () => axios.get(`Configuration/${id}/Schema`),
    queryKey: ['configuration', id, 'schema'],
    select: resolveSchemaRefs,
  });

export const useConfigurationQuery = (id: string) =>
  useQuery<Record<string, unknown>>({
    queryFn: () => axios.get(`Configuration/${id}`),
    queryKey: ['configuration', id],
  });
