import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

export const useUpdateWebuiMutation = () =>
  useMutation({
    mutationFn: (channel: 'Stable' | 'Dev') => axios.post('WebUI/Update', null, { params: { channel } }),
  });
