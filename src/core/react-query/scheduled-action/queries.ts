import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { isBusy } from '@/core/react-query/scheduled-action/helpers';

import type { ScheduledActionType } from '@/core/types/api/scheduled-action';

/**
 * The scheduled actions. No feed reports their runs, so the list is fetched again while the page is open: every few
 * seconds while one is in the queue, otherwise every half minute.
 */
export const useScheduledActionsQuery = () =>
  useQuery<ScheduledActionType[]>({
    queryKey: ['scheduled-action'],
    queryFn: () => axios.get('Action/Scheduled'),
    refetchInterval: query => (query.state.data?.some(action => isBusy(action.State)) ? 2000 : 30000),
  });
