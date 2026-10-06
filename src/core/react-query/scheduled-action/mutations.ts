import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';

import type { ScheduledActionTriggerType, ScheduledActionType } from '@/core/types/api/scheduled-action';

// Every route answers with the scheduled action as it is now, so it replaces the listed one at once.
const updateAction = (action: ScheduledActionType) => {
  queryClient.setQueryData<ScheduledActionType[]>(
    ['scheduled-action'],
    actions => actions?.map(item => (item.ID === action.ID ? action : item)),
  );
  invalidateQueries(['scheduled-action']);
};

export const useInvokeScheduledActionMutation = () =>
  useMutation({
    mutationFn: (id: string) => axios.post<unknown, ScheduledActionType>(`Action/Scheduled/${id}`),
    onSuccess: updateAction,
  });

export const useCancelScheduledActionMutation = () =>
  useMutation({
    mutationFn: (id: string) => axios.post<unknown, ScheduledActionType>(`Action/Scheduled/${id}/Cancel`),
    onSuccess: updateAction,
  });

export const useSetScheduledActionTriggersMutation = () =>
  useMutation({
    mutationFn: ({ id, triggers }: { id: string, triggers: ScheduledActionTriggerType[] }) =>
      axios.put<unknown, ScheduledActionType>(`Action/Scheduled/${id}/Triggers`, triggers),
    onSuccess: updateAction,
  });

export const useResetScheduledActionTriggersMutation = () =>
  useMutation({
    mutationFn: (id: string) => axios.delete<unknown, ScheduledActionType>(`Action/Scheduled/${id}/Triggers`),
    onSuccess: updateAction,
  });
