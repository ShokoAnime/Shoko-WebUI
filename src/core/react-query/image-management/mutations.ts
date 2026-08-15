import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

export const useDeleteImageCrossReferenceMutation = () =>
  useMutation({
    mutationFn: (xrefId: number) => axios.delete(`Image/Management/CrossReference/${xrefId}`),
    onSuccess: () => {
      invalidateQueries(['image-management', 'cross-references']);
    },
  });
