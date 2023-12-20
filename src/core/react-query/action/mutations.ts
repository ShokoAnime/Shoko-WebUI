import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

export const useRunActionMutation = () =>
  useMutation({
    mutationFn: (action: string) => axios.get(`Action/${action}`),
  });
