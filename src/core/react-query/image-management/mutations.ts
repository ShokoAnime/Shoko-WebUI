import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

export const useSetPreferredImageMutation = () =>
  useMutation({
    mutationFn: (xrefId: number) => axios.put(`Image/Management/CrossReference/${xrefId}/Preferred`),
    onSuccess: () => {
      invalidateQueries(['image-management', 'cross-references']);
    },
  });
