import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  DeleteFileLinkRequestType,
  IgnoreFileRequestType,
  LinkManyFilesToOneEpisodeRequestType,
  LinkOneFileToManyEpisodesRequestType,
} from '@/core/react-query/file/types';

export const useAvdumpFileMutation = () =>
  useMutation({
    mutationFn: (fileId: number) =>
      axios.post(
        `File/${fileId}/AVDump`,
        null,
        { params: { immediate: false } },
      ),
  });

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
    mutationFn: ({ fileId, ignore }: IgnoreFileRequestType) => axios.put(`File/${fileId}/Ignore?value=${ignore}`),
    onSuccess: () => invalidateQueries(['files', { include: ['Ignored'], include_only: ['Ignored'] }]),
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

export const useRehashFileMutation = () =>
  useMutation({
    mutationFn: (fileId: number) => axios.post(`File/${fileId}/Rehash`),
  });

export const useRescanFileMutation = () =>
  useMutation({
    mutationFn: (fileId: number) => axios.post(`File/${fileId}/Rescan`),
  });
