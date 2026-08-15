import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

export const useDeleteImageMutation = () =>
  useMutation({
    mutationFn: (imageID: string) => axios.delete(`Image/Management/${imageID}`),
    onSuccess: () => {
      invalidateQueries(['series']);
    },
  });
