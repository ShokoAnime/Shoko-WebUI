import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type { ConfigurationActionResultType } from '@/core/types/api/configuration';

/** Overwrites a configuration through `PUT Configuration/{id}`. A refused save answers with `ValidationErrors`. */
export const useUpdateConfigurationMutation = (id: string) =>
  useMutation({
    mutationFn: (configuration: Record<string, unknown>) =>
      axios.put<unknown, ConfigurationActionResultType>(`Configuration/${id}`, configuration),
    onSuccess: (result) => {
      if (result.ValidationErrors && Object.keys(result.ValidationErrors).length > 0) return;
      invalidateQueries(['configuration', id]);
    },
  });
