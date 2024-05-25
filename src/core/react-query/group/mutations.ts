import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  CreateGroupRequestType,
  MoveSeriesGroupRequestType,
  PatchGroupRequestType,
} from '@/core/react-query/group/types';

/**
 * This all needs much more work on query invalidation.
 * Currently, it's naïve and only invalidates the current series query.
 * It should probably invalidate the cache for the before/after state of any series belonging to impacted groups.
 */

export const usePatchGroupMutation = () =>
  useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- seriesId is used later for query invalidation
    mutationFn: ({ groupId, operations, seriesId }: PatchGroupRequestType) =>
      axios.patch(
        `Group/${groupId}`,
        operations,
      ),
    onSuccess: (_, { seriesId }) => invalidateQueries(['series', seriesId]),
  });

export const useCreateGroupMutation = () =>
  useMutation({
    mutationFn: ({ seriesId }: CreateGroupRequestType) =>
      axios.post(
        'Group',
        {
          PreferredSeriesID: seriesId,
          SeriesIDs: [seriesId],
        },
      ),
    onSuccess: (_, { seriesId }) => invalidateQueries(['series', seriesId]),
  });

export const useMoveGroupMutation = () =>
  useMutation({
    mutationFn: ({ groupId, seriesId }: MoveSeriesGroupRequestType) =>
      axios.patch(`Series/${seriesId}/Move/${groupId}`),
    onSuccess: (_, { seriesId }) => invalidateQueries(['series', seriesId]),
  });
