import { useMutation } from '@tanstack/react-query';

import toast from '@/components/Toast';
import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  DeleteSeriesRequestType,
  RefreshAniDBSeriesRequestType,
  RefreshSeriesAniDBInfoRequestType,
  WatchSeriesEpisodesRequestType,
} from '@/core/react-query/series/types';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

export const useChangeSeriesImageMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (image: ImageType) =>
      axios.put(
        `Series/${seriesId}/Images/${image.Type}`,
        {
          ID: image.ID,
          Source: image.Source,
        },
      ),
    onSuccess: (_, image) => {
      toast.success(`Series ${image.Type} image has been changed.`);
      invalidateQueries(['series', seriesId, 'data']);
      invalidateQueries(['series', seriesId, 'images']);
    },
  });

export const useDeleteSeriesMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, ...params }: DeleteSeriesRequestType) => axios.delete(`Series/${seriesId}`, { params }),
    onSuccess: () => {
      invalidateQueries(['filter']);
      invalidateQueries(['series', 'without-files']);
    },
  });

// This is actually a query but we had to declare it as mutation to use it properly as lazy query.
export const useGetSeriesAniDBMutation = () =>
  useMutation<SeriesAniDBSearchResult, unknown, number>({
    mutationFn: (anidbId: number) => axios.get(`Series/AniDB/${anidbId}`),
  });

export const useOverrideSeriesTitleMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (Title: string) => axios.post(`Series/${seriesId}/OverrideTitle`, { Title }),
    onSuccess: (_) => {
      toast.success('Name updated successfully!');
      invalidateQueries(['series', seriesId, 'data']);
    },
    onError: () => toast.error('Name could not be updated!'),
  });

export const useRefreshAniDBSeriesMutation = () =>
  useMutation<boolean, unknown, RefreshAniDBSeriesRequestType>({
    mutationFn: ({ anidbID, ...params }: RefreshAniDBSeriesRequestType) =>
      axios.post(
        `Series/AniDB/${anidbID}/Refresh`,
        null,
        { params },
      ),
    onSuccess: (response, { anidbID }) => {
      if (!response) throw Error(); // Consider 'false' response as error.

      invalidateQueries(['series', 'anidb', anidbID]);
    },
  });

export const useRefreshSeriesAniDBInfoMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (params: RefreshSeriesAniDBInfoRequestType) =>
      axios.post(`Series/${seriesId}/AniDB/Refresh`, null, { params }),
    onSuccess: () => toast.success('AniDB refresh queued!'),
  });

export const useRehashSeriesFilesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.post(`Series/${seriesId}/File/Rehash`),
    onSuccess: () => toast.success('Series files rehash queued!'),
  });

export const useRescanSeriesFilesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.post(`Series/${seriesId}/File/Rescan`),
    onSuccess: () => toast.success('Series files rescan queued!'),
  });

export const useVoteSeriesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (rating: number) => axios.post(`Series/${seriesId}/Vote`, { Value: rating, MaxValue: 10 }),
    onSuccess: (_) => {
      toast.success('Voted!');
      invalidateQueries(['series', seriesId, 'data']);
    },
    onError: () => toast.error('Failed to vote!'),
  });

export const useWatchSeriesEpisodesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (params: WatchSeriesEpisodesRequestType) =>
      axios.post(`Series/${seriesId}/Episode/Watched`, null, { params }),
    onSuccess: (_, { value }) => {
      toast.success(`Episodes marked as ${value ? 'watched' : 'unwatched'}!`);
      invalidateQueries(['series', seriesId, 'data']);
      invalidateQueries(['series', seriesId, 'episodes']);
    },
    onError: (_, { value }) => toast.error(`Failed to mark episodes as ${value ? 'watched' : 'unwatched'}!`),
  });

export const useAutoSearchTmdbMatchMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.post(`Series/${seriesId}/TMDB/Action/AutoSearch`),
    onSuccess: () => toast.success('TMDB auto-search queued!'),
  });

export const useRefreshSeriesTMDBInfoMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () =>
      Promise.all([
        axios.post(`Series/${seriesId}/TMDB/Show/Action/Refresh`, {}),
        axios.post(`Series/${seriesId}/TMDB/Movie/Action/Refresh`, {}),
      ]),
    onSuccess: () => toast.success('TMDB refresh queued!'),
  });

export const useUpdateSeriesTMDBImagesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: ({ force = false }: { force?: boolean }) =>
      Promise.all([
        axios.post(`Series/${seriesId}/TMDB/Show/Action/DownloadImages`, { force }),
        axios.post(`Series/${seriesId}/TMDB/Movie/Action/DownloadImages`, { force }),
      ]),
    onSuccess: () => toast.success('TMDB image download queued!'),
  });

export const useRefreshSeriesTraktInfoMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.post(`Series/${seriesId}/Trakt/Refresh`),
    onSuccess: () => toast.success('Trakt refresh queued!'),
  });

export const useSyncSeriesTraktMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.post(`Series/${seriesId}/Trakt/Sync`),
    onSuccess: () => toast.success('Trakt sync queued!'),
  });
