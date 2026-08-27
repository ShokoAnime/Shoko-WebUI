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

export const useServerRestartMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Init/Restart'),
  });

export const useServerShutdownMutation = () =>
  useMutation({
    mutationFn: () => axios.post('Init/Shutdown'),
  });
