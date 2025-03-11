import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ManagedFolderType } from '@/core/types/api/managed-folder';

export const useManagedFoldersQuery = () =>
  useQuery<ManagedFolderType[]>({
    queryKey: ['managed-folder'],
    queryFn: () => axios.get('ManagedFolder'),
  });
