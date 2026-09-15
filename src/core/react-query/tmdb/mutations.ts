import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { downloadBlob } from '@/core/util';

import type {
  TmdbAddAutoXrefsRequestType,
  TmdbAddLinkRequestType,
  TmdbDeleteLinkRequestType,
  TmdbEditEpisodeXrefsRequestType,
  TmdbExportRequestType,
  TmdbImportRequestType,
  TmdbRefreshRequestType,
} from '@/core/react-query/tmdb/types';

export const useTmdbExportXrefsMutation = () =>
  useMutation({
    mutationFn: async (data: TmdbExportRequestType) => {
      const blob = await axios.post<Blob, Blob>('Tmdb/Export', data, { responseType: 'blob' });
      // The server responds with a blank file (at most a few line breaks) when nothing matched.
      const isEmpty = (await blob.text()).trim() === '';
      return { blob, isEmpty };
    },
    onSuccess: ({ blob, isEmpty }) => {
      if (isEmpty) return;
      // The shared axios instance unwraps response.data, so the Content-Disposition header
      // is not reachable; use the same filename the server sends.
      downloadBlob(blob, 'anidb_tmdb_xrefs.csv');
    },
  });

export const useTmdbImportXrefsMutation = () =>
  useMutation({
    mutationFn: ({ file, ...params }: TmdbImportRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post('Tmdb/Import', formData, { params });
    },
    onSuccess: () => {
      // Imported links can touch any series, and all TMDB link/metadata queries live under 'series'.
      invalidateQueries(['series']);
      // "Missing TMDB Links" count.
      invalidateQueries(['dashboard', 'stats']);
    },
  });

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

export const useSetPreferredTmdbShowOrderingMutation = (showId: number) =>
  useMutation({
    mutationFn: (alternateOrderingId: string) =>
      axios.post(`Tmdb/Show/${showId}/Ordering/SetPreferred`, { AlternateOrderingID: alternateOrderingId }),
    onSuccess: () => {
      invalidateQueries(['series', 'tmdb', 'show']);
      invalidateQueries(['series', 'tmdb', 'episode']);
    },
  });
