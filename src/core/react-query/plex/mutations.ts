import { useMutation } from '@tanstack/react-query';

import { axiosPlex as axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

export const useInvalidatePlexTokenMutation = () =>
  useMutation({
    mutationFn: () => axios.get('token/invalidate'),
    onSuccess: () => queryClient.resetQueries({ queryKey: ['plex', 'status'] }),
  });

export const useChangePlexServerMutation = () =>
  useMutation({
    mutationFn: (serverId: string) =>
      axios.post(
        'server',
        serverId,
        { headers: { 'Content-Type': 'application/json' } },
      ),
    onSuccess: () => queryClient.resetQueries({ queryKey: ['plex', 'libraries'] }),
  });

export const useChangePlexLibrariesMutation = () =>
  useMutation({
    mutationFn: (libraries: number[]) => axios.post('libraries', libraries),
  });
