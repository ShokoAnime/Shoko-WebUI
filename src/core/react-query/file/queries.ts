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

// TODO: This should use FileRequestType for params in queryKey
// export const useFileQuery = (fileId: number, params?: FileRequestType, enabled = true) =>
//   useQuery<FileType>({
//     queryKey: ['file', 'single', fileId, params],
//     queryFn: () => axios.get(`File/${fileId}`, { params }),
//     enabled,
//   });
const queryBuilder = (params?: FileRequestType) => {
  if (!params) return null;
  const result = { ...params, includeMediaInfo: false, includeXRefs: false, includeAbsolutePaths: false };
  if (!params.include?.length) return result;

  // eslint-disable-next-line no-restricted-syntax
  for (const type of params.include) {
    switch (type) {
      case 'MediaInfo':
        result.includeMediaInfo = true;
        break;
      case 'XRefs':
        result.includeXRefs = true;
        break;
      case 'AbsolutePaths':
        result.includeAbsolutePaths = true;
        break;
      default:
        break;
    }
  }

  return result;
};

export const useFileQuery = (fileId: number, params?: FileRequestType, enabled = true) =>
  useQuery<FileType>({
    queryKey: ['file', 'single', fileId, queryBuilder(params)],
    queryFn: () => axios.get(`File/${fileId}`, { params: queryBuilder(params) }),
    enabled,
  });
