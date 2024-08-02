import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformRenamer, transformRenamerConfigs } from '@/core/react-query/renamer/helpers';

import type {
  RenamerConfigResponseType,
  RenamerConfigType,
  RenamerResponseType,
  RenamerType,
} from '@/core/react-query/renamer/types';

export const useRenamersQuery = (enabled = true) =>
  useQuery<RenamerResponseType[]>({
    queryKey: ['renamer', 'all'],
    queryFn: () => axios.get('Renamer'),
    enabled,
  });

export const useRenamerConfigsQuery = (enabled = true) =>
  useQuery<RenamerConfigResponseType[], unknown, RenamerConfigType[]>({
    queryKey: ['renamer', 'config'],
    queryFn: () => axios.get('Renamer/Config'),
    select: transformRenamerConfigs,
    enabled,
  });

export const useRenamerByConfigQuery = (renamerConfig: string, enabled = true) =>
  useQuery<RenamerResponseType, unknown, RenamerType>({
    queryKey: ['renamer', 'by-config', renamerConfig],
    queryFn: () => axios.get(`Renamer/Config/${renamerConfig}/Renamer`),
    select: transformRenamer,
    enabled,
  });
