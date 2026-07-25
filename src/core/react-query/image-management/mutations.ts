import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { UploadSeriesImageRequestType } from './types';
import type { ImageSlimType } from '@/core/types/api/image';

export const useSetPreferredImageMutation = () =>
  useMutation({
    mutationFn: (xrefId: number) => axios.put(`Image/Management/CrossReference/${xrefId}/Preferred`),
    onSuccess: () => {
      invalidateQueries(['image-management', 'cross-references']);
    },
  });

export const useUnsetPreferredImageMutation = () =>
  useMutation({
    mutationFn: (xrefId: number) => axios.delete(`Image/Management/CrossReference/${xrefId}/Preferred`),
    onSuccess: () => {
      invalidateQueries(['image-management', 'cross-references']);
    },
  });

export const useDeleteImageCrossReferenceMutation = () =>
  useMutation({
    mutationFn: (xrefId: number) => axios.delete(`Image/Management/CrossReference/${xrefId}`),
    onSuccess: () => {
      invalidateQueries(['image-management', 'cross-references']);
    },
  });

/** Uploads an image file and links it to a series via a two-step flow:
 *  1. POST /Image/Management/Upload (multipart) — returns the new image's UID.
 *  2. POST /Image/Management/CrossReference/Entity/Shoko/Series/{seriesId} — creates the cross-reference.
 *  Invalidates the cross-references query for the series on success. */
export const useUploadSeriesImageMutation = () =>
  useMutation({
    mutationFn: async ({ file, imageType, seriesId }: UploadSeriesImageRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userSubmitted', 'true');

      const imageSlim: ImageSlimType = await axios.post('Image/Management/Upload', formData);

      try {
        return await axios.post(
          `Image/Management/CrossReference/Entity/Shoko/Series/${seriesId}`,
          {
            ImageID: imageSlim.UID,
            ImageType: imageType,
          },
        );
      } catch (error) {
        await axios.delete(`Image/Management/${imageSlim.UID}`);
        throw error;
      }
    },
    onSuccess: (_, { seriesId }) => {
      invalidateQueries(['image-management', 'cross-references', seriesId]);
    },
  });
