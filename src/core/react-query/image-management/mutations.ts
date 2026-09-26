import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

export const useDeleteImageMutation = () =>
  useMutation({
    mutationFn: (imageID: string) => axios.delete(`Image/Management/${imageID}`),
    onSuccess: () => {
      toast.success('Image deleted.');
      invalidateQueries(['series']);
      invalidateQueries(['group']);
      invalidateQueries(['filter', 'preview']);
    },
    onError: () => toast.error('Failed to delete image.'),
  });
