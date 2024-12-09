import { type InfiniteData, useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import { findIndex, forEach } from 'lodash';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  DeleteFileLocationRequestType,
  DeleteFileRequestType,
  DeleteFilesRequestType,
  IgnoreFileRequestType,
  LinkManyFilesToOneEpisodeRequestType,
  LinkOneFileToManyEpisodesRequestType,
  MarkVariationRequestType,
} from '@/core/react-query/file/types';
import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';

export const useAddFileToMyListMutation = () =>
  useMutation({
    mutationFn: (fileId: number) => axios.post(`File/${fileId}/AddToMyList`),
  });

export const useDeleteFilesMutation = () =>
  useMutation({
    mutationFn: (data: DeleteFilesRequestType) => axios.delete('File', { data }),
  });

export const useDeleteFileMutation = (seriesId?: number, episodeId?: number) =>
  useMutation({
    mutationFn: ({ fileId, removeFolder }: DeleteFileRequestType) =>
      axios.delete(`File/${fileId}`, { data: { removeFolder } }),
    onSuccess: () => {
      if (!seriesId || !episodeId) return;

      queryClient.setQueriesData(
        {
          queryKey: ['series', seriesId, 'episodes'],
          type: 'active',
        },
        (data: InfiniteData<ListResultType<EpisodeType>>) =>
          produce(data, (draftState) => {
            forEach(draftState.pages, (draftState2) => {
              const index = findIndex(draftState2.List, { IDs: { ID: episodeId } });
              if (index === -1) return true;
              draftState2.List[index].Size -= 1;
              // Returning false will stop the loop.
              return false;
            });
            return draftState;
          }),
      );
    },
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

export const useDeleteFileLocationMutation = () =>
  useMutation({
    mutationFn: ({ locationId }: DeleteFileLocationRequestType) => axios.delete(`File/Location/${locationId}`),
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
