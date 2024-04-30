import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  DeleteFileLinkRequestType,
  IgnoreFileRequestType,
  LinkManyFilesToOneEpisodeRequestType,
  LinkOneFileToManyEpisodesRequestType,
  MarkVariationRequestType,
} from '@/core/react-query/file/types';

export const useDeleteFileMutation = () =>
  useMutation({
    mutationFn: ({ fileId, removeFolder }: DeleteFileLinkRequestType) =>
      axios.delete(`File/${fileId}`, { data: { removeFolder } }),
  });

export const useDeleteFileLinkMutation = () =>
  useMutation({
    mutationFn: (fileId: number) =>
      axios.delete(
        `File/${fileId}/Link`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Content-Type is not preserved by axios if data is not set to null.
          data: null,
        },
      ),
  });

export const useIgnoreFileMutation = () =>
  useMutation({
    mutationFn: ({ fileId, ignore }: IgnoreFileRequestType) =>
      axios.put(`File/${fileId}/Ignore`, undefined, { params: { value: ignore } }),
    onSuccess: () => invalidateQueries(['files']),
  });

export const useLinkOneFileToManyEpisodesMutation = () =>
  useMutation({
    mutationFn: ({ episodeIDs, fileId }: LinkOneFileToManyEpisodesRequestType) =>
      axios.post(`File/${fileId}/Link`, { episodeIDs }),
  });

export const useLinkManyFilesToOneEpisodeMutation = () =>
  useMutation({
    mutationFn: (data: LinkManyFilesToOneEpisodeRequestType) => axios.post('File/Link', data),
  });

export const useMarkVariationMutation = () =>
  useMutation({
    mutationFn: ({ fileId, variation }: MarkVariationRequestType) =>
      axios.put(`File/${fileId}/Variation`, undefined, { params: { value: variation } }),
    onSuccess: () => invalidateQueries(['episode', 'files']),
  });

export const useRehashFileMutation = () =>
  useMutation({
    mutationFn: (fileId: number) => axios.post(`File/${fileId}/Rehash`),
  });

export const useRescanFileMutation = () =>
  useMutation({
    mutationFn: (fileId: number) => axios.post(`File/${fileId}/Rescan`),
    onSuccess: () => invalidateQueries(['episode', 'files']),
  });
