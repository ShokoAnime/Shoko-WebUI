import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  AnilistAddAutoXrefsRequestType,
  AnilistAddLinkRequestType,
  AnilistDeleteLinkRequestType,
  AnilistEditEpisodeXrefsRequestType,
  AnilistExportRequestType,
  AnilistImportRequestType,
  AnilistRefreshRequestType,
  AnilistSeriesRefreshRequestType,
} from '@/core/react-query/anilist/types';

export const useAnilistRefreshMutation = () =>
  useMutation({
    mutationFn: ({ anilistId, ...data }: AnilistRefreshRequestType) =>
      axios.post(`Anilist/Anime/${anilistId}/Action/Refresh`, data),
  });

export const useAnilistSeriesRefreshMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: AnilistSeriesRefreshRequestType = {}) =>
      axios.post(`Series/${seriesId}/Anilist/Anime/Action/Refresh`, data),
  });

export const useAnilistScheduleAutoSearchMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (force?: boolean) =>
      axios.post(`Series/${seriesId}/Anilist/Action/AutoSearch`, null, { params: { force: force ?? false } }),
  });

export const useAnilistAddLinkMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: AnilistAddLinkRequestType) => axios.post(`Series/${seriesId}/Anilist/Anime`, data),
  });

export const useDeleteAnilistLinkMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: AnilistDeleteLinkRequestType = {}) => axios.delete(`Series/${seriesId}/Anilist/Anime`, { data }),
  });

export const useAnilistEditEpisodeXrefsMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: AnilistEditEpisodeXrefsRequestType) =>
      axios.post(`Series/${seriesId}/Anilist/Anime/CrossReferences/Episode`, data),
  });

export const useAnilistResetEpisodeXrefsMutation = (seriesId: number) =>
  useMutation({
    mutationFn: () => axios.delete(`Series/${seriesId}/Anilist/Anime/CrossReferences/Episode`),
    onSuccess: () => {
      invalidateQueries(['series', seriesId, 'anilist', 'cross-references']);
    },
  });

export const useAnilistAddAutoXrefsMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: AnilistAddAutoXrefsRequestType = {}) =>
      axios.post(`Series/${seriesId}/Anilist/Anime/CrossReferences/Episode/Auto`, data),
  });

export const useDeleteAnilistAnimeMutation = () =>
  useMutation({
    mutationFn: (anilistId: number) => axios.delete(`Anilist/Anime/${anilistId}`),
    onSuccess: () => {
      invalidateQueries(['series', 'anilist', 'anime']);
    },
  });

export const useAnilistExportMutation = () =>
  useMutation({
    mutationFn: (data: AnilistExportRequestType = {}) =>
      axios.post<string, string>('Anilist/Export', data, { responseType: 'text' }),
  });

export const useAnilistImportMutation = () =>
  useMutation({
    mutationFn: ({ addMissingAnime, file, removeExisting }: AnilistImportRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post('Anilist/Import', formData, { params: { removeExisting, addMissingAnime } });
    },
    onSuccess: () => {
      invalidateQueries(['series']);
    },
  });
