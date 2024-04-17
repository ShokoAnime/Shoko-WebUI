import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  ChangeSeriesImageRequestType,
  DeleteSeriesRequestType,
  RefreshAniDBSeriesRequestType,
  RefreshSeriesAniDBInfoRequestType,
  RefreshSeriesTvdbInfoRequestType,
  WatchSeriesEpisodesRequestType,
} from '@/core/react-query/series/types';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

export const useChangeSeriesImageMutation = () =>
  useMutation({
    mutationFn: ({ image, seriesId }: ChangeSeriesImageRequestType) =>
      axios.put(
        `Series/${seriesId}/Images/${image.Type}`,
        {
          ID: image.ID,
          Source: image.Source,
        },
      ),
    onSuccess: () => {
      invalidateQueries(['series', 'single']);
      invalidateQueries(['series', 'images']);
    },
  });

export const useDeleteSeriesMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, ...data }: DeleteSeriesRequestType) => axios.delete(`Series/${seriesId}`, { data }),
    onSuccess: () => {
      invalidateQueries(['filter']);
      invalidateQueries(['series', 'without-files']);
    },
  });

export const useDeleteSeriesTvdbLinkMutation = () =>
  useMutation({
    mutationFn: (seriesId: number) => axios.delete(`Series/${seriesId}/TvDB`),
    onSuccess: () => invalidateQueries(['series', 'episodes']),
  });

// This is actually a query but we had to declare it as mutation to use it properly as lazy query.
export const useGetSeriesAniDBMutation = () =>
  useMutation<SeriesAniDBSearchResult, unknown, number>({
    mutationFn: (anidbId: number) => axios.get(`Series/AniDB/${anidbId}`),
  });

export const useRefreshAniDBSeriesMutation = () =>
  useMutation<boolean, unknown, RefreshAniDBSeriesRequestType>({
    mutationFn: ({ anidbID, ...params }: RefreshAniDBSeriesRequestType) =>
      axios.post(
        `Series/AniDB/${anidbID}/Refresh`,
        null,
        { params },
      ),
    onSuccess: (response) => {
      if (!response) throw Error(); // Consider 'false' response as error.

      invalidateQueries(['series', 'anidb']);
      invalidateQueries(['series', 'anidb-search']);
      invalidateQueries(['series', 'episodes']);
    },
  });

export const useRefreshSeriesAniDBInfoMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, ...params }: RefreshSeriesAniDBInfoRequestType) =>
      axios.post(`Series/${seriesId}/AniDB/Refresh`, null, { params }),
  });

export const useRefreshSeriesTvdbInfoMutatation = () =>
  useMutation({
    mutationFn: ({ seriesId, ...params }: RefreshSeriesTvdbInfoRequestType) =>
      axios.post(`Series/${seriesId}/TvDB/Refresh`, null, { params }),
  });

export const useRehashSeriesFilesMutation = () =>
  useMutation({
    mutationFn: (seriesId: number) => axios.post(`Series/${seriesId}/File/Rehash`),
  });

export const useRescanSeriesFilesMutation = () =>
  useMutation({
    mutationFn: (seriesId: number) => axios.post(`Series/${seriesId}/File/Rescan`),
  });

export const useWatchSeriesEpisodesMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, ...params }: WatchSeriesEpisodesRequestType) =>
      axios.post(`Series/${seriesId}/Episode/Watched`, null, { params }),
    onSuccess: () => {
      invalidateQueries(['series', 'single']);
      invalidateQueries(['series', 'episodes']);
    },
  });
