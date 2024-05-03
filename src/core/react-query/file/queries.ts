import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { FileRequestType } from '@/core/react-query/types';
import type { ListResultType } from '@/core/types/api';
import type { FileType } from '@/core/types/api/file';

export const useFilesInfiniteQuery = (params: FileRequestType, searchQuery?: string) =>
  useInfiniteQuery<ListResultType<FileType>>({
    queryKey: ['files', params, searchQuery],
    queryFn: ({ pageParam }) =>
      axios.get(
        searchQuery ? `File/Search/${searchQuery}` : 'File',
        {
          params: {
            ...params,
            // It is supposed to infer the type from the initialPageParam property but it doesn't work
            page: pageParam as number,
          },
        },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      if (!params.pageSize || lastPage.Total / params.pageSize <= lastPageParam) return undefined;
      return lastPageParam + 1;
    },
  });

export const useFileQuery = (fileId: number, params: FileRequestType, enabled = true) =>
  useQuery<FileType>({
    queryKey: ['file', fileId, params],
    queryFn: () => axios.get(`File/${fileId}`, { params }),
    enabled,
  });
