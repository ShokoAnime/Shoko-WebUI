import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type {
  MoveSeriesGroupRequestType,
  PatchGroupRequestType,
  UploadGroupImageRequestType,
} from '@/core/react-query/group/types';
import type { SeriesType } from '@/core/types/api/series';

// TODO: FIX INVALIDATIONS

/**
 * This file probably needs more work on query invalidation.
 * Currently, it's naive and only invalidates the current series query.
 * It should probably also invalidate the cache for:
 *  * Any series belonging to the "original" groups of a series.
 */
const defaultInvalidations = (seriesId: number) => {
  invalidateQueries(['series', seriesId, 'data']);
  invalidateQueries(['series', seriesId, 'group']);
  // TODO: Specifically fix this next invalidation to be less aggressive
  invalidateQueries(['filter', 'preview']);
};

// Also the server isn't sending SeriesUpdated events for the group changes

export const usePatchGroupMutation = () =>
  useMutation({
    mutationFn: ({ groupId, operations }: PatchGroupRequestType) => axios.patch(`Group/${groupId}`, operations),
    onSuccess: (_, { seriesId }) => {
      defaultInvalidations(seriesId);
      toast.success('Group updated!');
    },
  });

export const useCreateGroupMutation = () =>
  useMutation({
    mutationFn: (seriesId: number) =>
      axios.post(
        'Group',
        {
          PreferredSeriesID: seriesId,
          SeriesIDs: [seriesId],
        },
      ),
    onSuccess: (_, seriesId) => {
      defaultInvalidations(seriesId);
      toast.success('Created new group!');
    },
  });

export const useMoveGroupMutation = () =>
  useMutation({
    mutationFn: ({ groupId, seriesId }: MoveSeriesGroupRequestType) =>
      axios.patch(`Series/${seriesId}/Move/${groupId}`),
    onSuccess: (_, { seriesId }) => {
      defaultInvalidations(seriesId);
      toast.success('Moved series into new group!');
    },
  });

export const useRelocateGroupFilesMutation = (groupId: number) =>
  useMutation({
    mutationFn: async () => {
      const targetSeries = await axios.get<unknown, SeriesType[]>(`Group/${groupId}/Series`, {
        params: { recursive: true },
      });

      return Promise.all(
        targetSeries.map(
          series => axios.post(`Series/${series.IDs.ID}/File/Relocate`),
        ),
      );
    },
    onSuccess: () => toast.success('Group files renamed/moved!'),
  });

const groupImageInvalidations = (groupId: number) => {
  invalidateQueries(['group', groupId, 'images']);
  invalidateQueries(['group', groupId]);
  invalidateQueries(['filter', 'preview']);
};

export const useUploadGroupImageMutation = () =>
  useMutation({
    mutationFn: async ({ file, groupId, imageType }: UploadGroupImageRequestType) => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post(`Group/${groupId}/Images/${imageType}/Upload`, formData);
    },
    onSuccess: (_, { groupId }) => groupImageInvalidations(groupId),
  });

export const useSetGroupDefaultImageMutation = (groupId: number) =>
  useMutation({
    mutationFn: (imageUID: string) => axios.put(`Group/${groupId}/Images/Primary/Default`, { ID: imageUID }),
    onSuccess: () => groupImageInvalidations(groupId),
  });

export const useUnsetGroupDefaultImageMutation = (groupId: number) =>
  useMutation({
    mutationFn: () => axios.delete(`Group/${groupId}/Images/Primary/Default`),
    onSuccess: () => groupImageInvalidations(groupId),
  });
