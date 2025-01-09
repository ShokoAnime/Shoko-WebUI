import { useMutation } from '@tanstack/react-query';
import { applyPatch } from 'fast-json-patch';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';
import { updateApiErrors, updateResults } from '@/core/react-query/renamer/helpers';

import type {
  RenamerConfigResponseType,
  RenamerPatchRequestType,
  RenamerPreviewRequestType,
  RenamerRelocateRequestType,
} from '@/core/react-query/renamer/types';
import type { RenamerConfigType, RenamerResultType } from '@/core/types/api/renamer';

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
      axios.post(`Renamer/Config/${encodeURIComponent(configName)}/Relocate`, FileIDs, {
        params: { deleteEmptyDirectories, move, rename },
      }),
    onSuccess: updateResults,
    onError: updateApiErrors,
  });

export const useRenamerDeleteConfigMutation = () =>
  useMutation({
    mutationFn: (configName: string) => axios.delete(`Renamer/Config/${encodeURIComponent(configName)}`),
    onSuccess: () => invalidateQueries(['renamer']),
  });

export const useRenamerSaveConfigMutation = () =>
  useMutation({
    mutationFn: (config: RenamerConfigResponseType) =>
      axios.put(`Renamer/Config/${encodeURIComponent(config.Name)}`, config),
    onSuccess: () => invalidateQueries(['renamer']),
  });

export const useRenamerPatchConfigMutation = () =>
  useMutation<RenamerConfigType, unknown, RenamerPatchRequestType>({
    mutationFn: ({ configName, operations }) =>
      axios.patch(`Renamer/Config/${encodeURIComponent(configName)}`, operations),
    onMutate: ({ configName, operations }) => {
      const data = queryClient.getQueryData<RenamerConfigType[]>(['renamer', 'config'])?.slice();
      if (!data) return;

      const configIndex = data.findIndex(config => config.Name === configName);
      data[configIndex] = applyPatch(data[configIndex], operations).newDocument;

      // Side effects are not triggered if it's not set to [] first
      // There is someting wrong with how tanstack query's structural sharing works
      queryClient.setQueryData(['renamer', 'config'], []);
      queryClient.setQueryData(['renamer', 'config'], data);
    },
    onSuccess: () => {
      invalidateQueries(['renamer']);
      invalidateQueries(['settings']);
    },
  });

export const useRenamerNewConfigMutation = () =>
  useMutation<unknown, unknown, RenamerConfigResponseType>({
    mutationFn: config => axios.post('Renamer/Config', config),
    onMutate: (config) => {
      queryClient.setQueryData(
        ['renamer', 'config'],
        (data: RenamerConfigType[]) => [...data, config],
      );
    },
    onSuccess: () => invalidateQueries(['renamer']),
  });
