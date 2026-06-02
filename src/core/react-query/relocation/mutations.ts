import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { updateApiErrors, updateResults } from '@/core/react-query/relocation/helpers';

import type {
  CreateRelocationPresetRequestType,
  RelocationPreviewRequestType,
  RelocationRelocateRequestType,
  UpdateRelocationConfigurationRequestType,
  UpdateRelocationPresetRequestType,
} from '@/core/react-query/relocation/types';
import type { RelocationPresetType, RelocationResultType } from '@/core/types/api/relocation';

export const useCreateRelocationPresetMutation = () =>
  useMutation<RelocationPresetType, unknown, CreateRelocationPresetRequestType>({
    mutationFn: body => axios.post('Relocation/Preset', body),
    onSuccess: () => invalidateQueries(['relocation', 'preset']),
  });

export const useUpdateRelocationPresetMutation = () =>
  useMutation<RelocationPresetType, Error, UpdateRelocationPresetRequestType>({
    mutationFn: ({ presetId, ...body }) => axios.put(`Relocation/Preset/${presetId}`, body),
    onSuccess: () => invalidateQueries(['relocation', 'preset']),
  });

export const useDeleteRelocationPresetMutation = () =>
  useMutation({
    mutationFn: (presetId: string) => axios.delete(`Relocation/Preset/${presetId}`),
    onSuccess: () => invalidateQueries(['relocation', 'preset']),
  });

export const useUpdateRelocationConfigurationMutation = () =>
  useMutation({
    mutationFn: ({ presetId, ...body }: UpdateRelocationConfigurationRequestType) =>
      axios.put(`Relocation/Preset/${presetId}/Configuration`, body),
    onSuccess: (_, { presetId }) => invalidateQueries(['relocation', 'preset', presetId, 'configuration']),
  });

export const useRelocationPreviewMutation = () =>
  useMutation<RelocationResultType[], unknown, RelocationPreviewRequestType>({
    mutationFn: ({ allowRelocationInsideDestination, move, rename, ...body }) =>
      axios.post('Relocation/Preview', body, { params: { move, rename, allowRelocationInsideDestination } }),
    onSuccess: updateResults,
    onError: updateApiErrors,
  });

export const useRelocationRelocateMutation = () =>
  useMutation<RelocationResultType[], unknown, RelocationRelocateRequestType>({
    mutationFn: ({ FileIDs, presetId, ...params }) =>
      axios.post(`Relocation/Preset/${presetId}/Relocate`, FileIDs, { params }),
    onSuccess: updateResults,
    onError: updateApiErrors,
  });
