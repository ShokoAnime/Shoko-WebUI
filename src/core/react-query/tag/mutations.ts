import { useMutation } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { invalidateQueries } from '@/core/react-query/queryClient';

import type {
  AddRemoveUserTagRequestType,
  CreateUserTagRequestType,
  UpdateUserTagRequestType,
} from '@/core/react-query/tag/types';
import type { TagType } from '@/core/types/api/tags';

export const useCreateUserTagMutation = () =>
  useMutation<TagType, unknown, CreateUserTagRequestType>({
    mutationFn: (body: CreateUserTagRequestType) => axios.post('Tag/User', body),
    onSuccess: () => {
      invalidateQueries(['tags', 'user']);
    },
  });

export const useUpdateUserTagMutation = () =>
  useMutation({
    mutationFn: ({ tagId, ...body }: UpdateUserTagRequestType) => axios.put(`Tag/User/${tagId}`, body),
    onSuccess: () => {
      invalidateQueries(['tags', 'user']);
    },
  });

export const useDeleteUserTagMutation = () =>
  useMutation({
    mutationFn: (tagId: number) => axios.delete(`Tag/User/${tagId}`),
    onSuccess: () => {
      invalidateQueries(['tags', 'user']);
    },
  });

export const useAddUserTagMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, tagId }: AddRemoveUserTagRequestType) =>
      axios.post(`Series/${seriesId}/Tags/User`, { IDs: [tagId] }),
    onSuccess: (_, { seriesId }) => {
      invalidateQueries(['tags', 'user']);
      invalidateQueries(['series', seriesId, 'tags', 'user']);
    },
  });

export const useRemoveUserTagMutation = () =>
  useMutation({
    mutationFn: ({ seriesId, tagId }: AddRemoveUserTagRequestType) =>
      axios.delete(`Series/${seriesId}/Tags/User`, { data: { IDs: [tagId] } }),
    onSuccess: (_, { seriesId }) => {
      invalidateQueries(['tags', 'user']);
      invalidateQueries(['series', seriesId, 'tags', 'user']);
    },
  });
