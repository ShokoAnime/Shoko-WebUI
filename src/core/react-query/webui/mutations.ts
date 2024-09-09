import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';

import type { WebuiTheme } from '@/core/types/api/webui';

export const useUpdateWebuiMutation = () =>
  useMutation({
    mutationFn: (channel: 'Stable' | 'Dev') => axios.post('WebUI/Update', null, { params: { channel } }),
  });

export const useWebuiUploadThemeMutation = () =>
  useMutation<WebuiTheme, undefined, { file: File, preview?: boolean }>({
    mutationFn: ({ file, preview }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (preview) {
        formData.append('preview', 'true');
      }

      return axios.post('WebUI/Theme/AddFromFile', formData);
    },
  });
