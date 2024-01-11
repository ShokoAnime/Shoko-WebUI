import { useMutation } from '@tanstack/react-query';

import { axiosPlex as axios } from '@/core/axios';
import queryClient from '@/core/react-query/queryClient';

export const useInvalidatePlexTokenMutation = () =>
  useMutation({
    mutationFn: () => axios.get('token/invalidate'),
    onSuccess: () => queryClient.resetQueries({ queryKey: ['plex'] }),
  });
