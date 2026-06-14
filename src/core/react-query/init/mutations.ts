import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { UserRequestType } from '@/core/react-query/init/types';

export const useCompleteSetupMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Init/CompleteSetup'),
  });

export const useSetDefaultUserMutation = () =>
  useMutation({
    mutationFn: (user: UserRequestType) => axios.post('Init/DefaultUser', user),
  });
