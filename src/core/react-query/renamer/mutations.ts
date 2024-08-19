import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { updateApiErrors, updateResults } from '@/core/react-query/renamer/helpers';

import type {
  RenamerConfigResponseType,
  RenamerPreviewRequestType,
  RenamerRelocateRequestType,
  RenamerResultType,
} from '@/core/react-query/renamer/types';
import type { Operation } from 'fast-json-patch';

export const useRenamerPreviewMutation = () =>
  useMutation<RenamerResultType[], unknown, RenamerPreviewRequestType>({
    mutationFn: ({ move, rename, ...body }) => axios.post('Renamer/Preview', body, { params: { move, rename } }),
    onSuccess: updateResults,
    onError: updateApiErrors,
  });

export const useRenamerRelocateMutation = () =>
  useMutation<RenamerResultType[], unknown, RenamerRelocateRequestType>({
    mutationFn: (
      { FileIDs, configName, deleteEmptyDirectories, move, rename },
    ) =>
      axios.post(`Renamer/Config/${configName}/Relocate`, FileIDs, {
        params: { deleteEmptyDirectories, move, rename },
      }),
    onSuccess: updateResults,
    onError: updateApiErrors,
  });

export const useRenamerDeleteConfigMutation = () =>
  useMutation({
    mutationFn: (configName: string) => axios.delete(`Renamer/Config/${configName}`),
    onSuccess: () => invalidateQueries(['renamer']),
  });

export const useRenamerSaveConfigMutation = () =>
  useMutation({
    mutationFn: (config: RenamerConfigResponseType) => axios.put(`Renamer/Config/${config.Name}`, config),
    onSuccess: () => invalidateQueries(['renamer']),
  });

export const useRenamerPatchConfigMutation = () =>
  useMutation({
    mutationFn: ({ configName, operations }: { configName: string, operations: Operation[] }) =>
      axios.patch(`Renamer/Config/${configName}`, operations),
    onSuccess: () => {
      invalidateQueries(['renamer']);
      invalidateQueries(['settings']);
    },
  });

export const useRenamerNewConfigMutation = () =>
  useMutation({
    mutationFn: (config: RenamerConfigResponseType) => axios.post('Renamer/Config', config),
    onSuccess: () => invalidateQueries(['renamer']),
  });
