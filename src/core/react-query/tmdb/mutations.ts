import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  TmdbAddAutoXrefsRequestType,
  TmdbAddLinkRequestType,
  TmdbDeleteLinkRequestType,
  TmdbEditEpisodeXrefsRequestType,
  TmdbRefreshRequestType,
} from '@/core/react-query/tmdb/types';

export const useTmdbRefreshMutation = (type: 'Show' | 'Movie') =>
  useMutation({
    mutationFn: ({ SkipIfExists = false, tmdbId, ...data }: TmdbRefreshRequestType) =>
      axios.post(`Tmdb/${type}/${tmdbId}/Action/Refresh`, {
        ...data,
        [type === 'Show' ? 'QuickRefresh' : 'SkipIfExists']: SkipIfExists,
      }),
  });

export const useTmdbAddLinkMutation = (seriesId: number, type: 'Show' | 'Movie') =>
  useMutation({
    mutationFn: (data: TmdbAddLinkRequestType) => axios.post(`Series/${seriesId}/TMDB/${type}`, data),
  });

export const useTmdbEditEpisodeXrefsMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: TmdbEditEpisodeXrefsRequestType) =>
      axios.post(`Series/${seriesId}/TMDB/Show/CrossReferences/Episode`, data),
  });

export const useTmdbAddAutoXrefsMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: TmdbAddAutoXrefsRequestType) =>
      axios.post(`Series/${seriesId}/TMDB/Show/CrossReferences/Episode/Auto`, data),
  });

export const useDeleteTmdbLinkMutation = (seriesId: number, linkType: 'Movie' | 'Show') =>
  useMutation({
    mutationFn: (data: TmdbDeleteLinkRequestType) => axios.delete(`Series/${seriesId}/TMDB/${linkType}`, { data }),
  });
