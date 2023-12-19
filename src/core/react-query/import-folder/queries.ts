import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { ImportFolderType } from '@/core/types/api/import-folder';

export const useImportFoldersQuery = () =>
  useQuery<ImportFolderType[]>({
    queryKey: ['import-folder'],
    queryFn: () => axios.get('ImportFolder'),
  });
