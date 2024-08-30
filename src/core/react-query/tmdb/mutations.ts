import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type {
  TmdbAddAutoCrossReferencesRequestType,
  TmdbAddLinkRequestType,
  TmdbDeleteLinkRequestType,
  TmdbRefreshRequestType,
} from '@/core/react-query/tmdb/types';

export const useTmdbRefreshMutation = (type: 'Show' | 'Movie') =>
  useMutation({
    mutationFn: ({ tmdbId, ...data }: TmdbRefreshRequestType) =>
      axios.post(`Tmdb/${type}/${tmdbId}/Action/Refresh`, data),
  });

export const useTmdbAddLinkMutation = (seriesId: number, type: 'Show' | 'Movie') =>
  useMutation({
    mutationFn: (data: TmdbAddLinkRequestType) => axios.post(`Series/${seriesId}/TMDB/${type}`, data),
  });

export const useTmdbAddAutoCrossReferencesMutation = (seriesId: number) =>
  useMutation({
    mutationFn: (data: TmdbAddAutoCrossReferencesRequestType) =>
      axios.post(`Series/${seriesId}/TMDB/Show/CrossReferences/Episode/Auto`, data),
  });

export const useDeleteTmdbLinkMutation = (seriesId: number, linkType: 'Movie' | 'Show') =>
  useMutation({
    mutationFn: (data: TmdbDeleteLinkRequestType) => axios.delete(`Series/${seriesId}/TMDB/${linkType}`, { data }),
  });
