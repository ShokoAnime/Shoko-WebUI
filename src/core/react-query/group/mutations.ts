import { useMutation } from '@tanstack/react-query';

import toast from '@/components/Toast';
import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { MoveSeriesGroupRequestType, PatchGroupRequestType } from '@/core/react-query/group/types';
import type { SeriesType } from '@/core/types/api/series';

// TODO: FIX INVALIDATIONS

/**
 * This file probably needs more work on query invalidation.
 * Currently, it's naïve and only invalidates the current series query.
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
