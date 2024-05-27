import { useMutation } from '@tanstack/react-query';

import toast from '@/components/Toast';
import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { MoveSeriesGroupRequestType, PatchGroupRequestType } from '@/core/react-query/group/types';

/**
 * This file probably needs more work on query invalidation.
 * Currently, it's naïve and only invalidates the current series query.
 * It should probably also invalidate the cache for:
 *  * Any series belonging to the "original" groups of a series.
 */

export const usePatchGroupMutation = () =>
  useMutation({
    mutationFn: ({ groupId, operations }: PatchGroupRequestType) => axios.patch(`Group/${groupId}`, operations),
    onSuccess: (_, { seriesId }) => {
      invalidateQueries(['series', seriesId, 'data']);
      invalidateQueries(['series', seriesId, 'group']);
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
      invalidateQueries(['series', seriesId, 'data']);
      invalidateQueries(['series', seriesId, 'group']);
      toast.success('Created new group!');
    },
  });

export const useMoveGroupMutation = () =>
  useMutation({
    mutationFn: ({ groupId, seriesId }: MoveSeriesGroupRequestType) =>
      axios.patch(`Series/${seriesId}/Move/${groupId}`),
    onSuccess: (_, { seriesId }) => {
      invalidateQueries(['series', seriesId, 'data']);
      invalidateQueries(['series', seriesId, 'group']);
      toast.success('Moved series into new group!');
    },
  });
