import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { UserRequestType } from '@/core/react-query/init/types';
import type { ServerStatusType } from '@/core/types/api/init';

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

// Checks a setup token by asking for the server status with it; the server still requires one when it is wrong.
export const useCheckSetupTokenMutation = () =>
  useMutation({
    mutationFn: (token: string) => axios.get<unknown, ServerStatusType>('Init/Status', { headers: { apikey: token } }),
  });
