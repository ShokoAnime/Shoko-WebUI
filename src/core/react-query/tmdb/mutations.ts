import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';
import { downloadBlob } from '@/core/util';

import type { TmdbExportRequestType, TmdbImportRequestType } from '@/core/react-query/tmdb/types';

export const useTmdbExportXrefsMutation = () =>
  useMutation({
    mutationFn: async (data: TmdbExportRequestType) => {
      const blob = await axios.post<Blob, Blob>('Tmdb/Export', data, { responseType: 'blob' });
      // The server responds with an empty body when nothing matched (sections only append
      // content when they have results).
      const isEmpty = blob.size === 0;
      return { blob, isEmpty };
    },
    onSuccess: ({ blob, isEmpty }) => {
      if (isEmpty) {
        toast.info('Nothing to export', 'No cross-references matched the selected options.');
        return;
      }
      toast.success('TMDB cross-references exported!');
      // The shared axios instance unwraps response.data, so the Content-Disposition header
      // is not reachable; use the same filename the server sends.
      downloadBlob(blob, 'anidb_tmdb_xrefs.csv');
    },
    onError: () => toast.error('Failed to export TMDB cross-references!'),
  });

export const useTmdbImportXrefsMutation = () =>
  useMutation({
    mutationFn: ({ file, ...params }: TmdbImportRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post('Tmdb/Import', formData, { params });
    },
    onSuccess: (_data, { removeExisting }) => {
      if (removeExisting) {
        toast.success('TMDB cross-references imported!', 'Existing cross-references were replaced.');
      } else {
        toast.success('TMDB cross-references imported!');
      }
      // Imported links can touch any series, and all TMDB link/metadata queries live under 'series'.
      invalidateQueries(['series']);
      // "Missing TMDB Links" count.
      invalidateQueries(['dashboard', 'stats']);
    },
    onError: () => toast.error('Failed to import TMDB cross-references!'),
  });
