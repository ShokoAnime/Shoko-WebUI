import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { updateApiErrors, updateErrorResults, updatePreviewResults } from '@/core/react-query/renamer/helpers';

import type {
  CreateRelocationPipeRequestType,
  ModifyRelocationPipeRequestType,
  PreviewRelocateFilesRequestType,
  RelocateFilesRequestType,
  RelocationSettingsRequestType,
} from '@/core/react-query/renamer/types';
import type { RelocationPipeType, RelocationResultType } from '@/core/types/api/renamer';

export const useRelocationSettingsMutation = () =>
  useMutation<void, unknown, RelocationSettingsRequestType>({
    mutationKey: ['relocation', 'settings'],
    mutationFn: settings => axios.put('Relocation/Settings', settings),
    onSuccess: () => invalidateQueries(['relocation', 'summary']),
  });

export const usePreviewFilesMutation = () =>
  useMutation<RelocationResultType[], unknown, PreviewRelocateFilesRequestType>({
    mutationFn: ({ move, rename, ...body }) => axios.post('Relocation/Preview', body, { params: { move, rename } }),
    onSuccess: updatePreviewResults,
    onError: updateApiErrors,
  });

export const useRelocateFilesWithPipeMutation = () =>
  useMutation<RelocationResultType[], unknown, RelocateFilesRequestType>({
    mutationFn: (
      { fileIDs, pipeId, deleteEmptyDirectories, move, rename },
    ) =>
      axios.post<unknown, RelocationResultType[]>(`Relocation/Pipe/${pipeId}/Relocate`, fileIDs, {
        params: { deleteEmptyDirectories, move, rename },
      })
        .catch((err) => fileIDs.map<RelocationResultType>((fileId) =>
            typeof err === 'object' && err && err instanceof Error
              ? ({
                IsSuccess: false,
                IsPreview: undefined,
                FileID: fileId,
                ErrorMessage: 'Web UI Error; ' + err.message,
              })
              : ({
                IsSuccess: false,
                IsPreview: undefined,
                FileID: fileId,
                ErrorMessage: 'Web UI Error; An unknown error occurred.',
              }),
          ),
        ),
      onSuccess: updateErrorResults,
  });

export const useDeleteRelocationPipeMutation = () =>
  useMutation({
    mutationFn: (pipeId: string) => axios.delete(`Relocation/Pipe/${pipeId}`),
    onSuccess: () => invalidateQueries(['relocation', 'pipe']),
  });

export const useSaveRelocationPipeMutation = () =>
  useMutation<RelocationPipeType, unknown, ModifyRelocationPipeRequestType>({
    mutationFn: ({ pipeId, ...pipe }: ModifyRelocationPipeRequestType) =>
      axios.put(`Relocation/Pipe/${pipeId}`, pipe),
    onSuccess: () => invalidateQueries(['relocation', 'pipe']),
  });

export const useSaveRelocationPipeConfigurationMutation = (pipeId: string) =>
  useMutation({
    mutationKey: ['relocation', 'pipe', pipeId, 'configuration'],
    mutationFn: (config: any) => axios.put<any, void>(`Relocation/Pipe/${pipeId}/Configuration`, config),
    onSuccess: () => invalidateQueries(['relocation', 'pipe', pipeId]),
  });

export const useCreateRelocationPipeMutation = () =>
  useMutation<RelocationPipeType, unknown, CreateRelocationPipeRequestType>({
    mutationFn: config => axios.post('Relocation/Pipe', config),
    onSuccess: () => invalidateQueries(['relocation', 'pipe']),
  });
