import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';
import queryClient from '@/core/react-query/queryClient';

import type { FileRequestType } from '@/core/react-query/types';
import type { ListResultType } from '@/core/types/api';
import type { AniDBEpisodeType } from '@/core/types/api/episode';
import type { FileType } from '@/core/types/api/file';

export const useEpisodeFilesQuery = (
  episodeId: number,
  params: FileRequestType,
  enabled = true,
) =>
  useQuery<ListResultType<FileType>, unknown, FileType[]>({
    queryKey: ['episode', 'files', episodeId, params],
    queryFn: () => axios.get(`Episode/${episodeId}/File`, { params }),
    select: transformListResultSimplified,
    enabled,
  });

export const useEpisodeAniDBQuery = (episodeId: number, enabled = true) =>
  useQuery<AniDBEpisodeType>({
    queryKey: ['episode', 'anidb', episodeId],
    queryFn: () => axios.get(`Episode/${episodeId}/AniDB`),
    enabled,
  });

const episodePlaceholderKey = ['episode', 'anidb', 'bulk', 'placeholder'] as const;

export const useEpisodeAniDbBulkQuery = (anidbIds: number[], enabled = true) => {
  useEffect(() => () => {
    queryClient.removeQueries({ queryKey: episodePlaceholderKey });
  }, []);

  return useQuery<Record<number, AniDBEpisodeType | null>>({
    queryKey: ['episode', 'anidb', 'bulk', anidbIds],
    queryFn: async () => {
      const existingPlaceholder =
        queryClient.getQueryData<Record<number, AniDBEpisodeType | null>>(episodePlaceholderKey) ?? {};
      const existingEntries = Object.entries(existingPlaceholder)
        .map(([key, value]) => [Number(key), value] as const)
        .filter(([key, value]) => !Number.isNaN(key) && Number.isInteger(key) && value != null);
      const existingKeys = new Map(existingEntries);
      const missingKeys = anidbIds.filter(key => !Number.isNaN(key) && Number.isInteger(key) && !existingKeys.has(key));
      const responses = await Promise.all(
        missingKeys.map(episodeId =>
          // eslint-disable-next-line @stylistic/comma-dangle -- ESLint and DPrint are fighting about the formatting here.
          axios.get<unknown, AniDBEpisodeType>(`Episode/AniDB/${episodeId}`).catch(() => null)
          // eslint-disable-next-line @stylistic/function-paren-newline -- ESLint and DPrint are fighting about the formatting here.
        ),
      );
      const entries = Object.fromEntries([
        ...existingEntries,
        ...responses.map((episode, index) => [missingKeys[index], episode] as const),
      ]);
      queryClient.setQueryData(episodePlaceholderKey, entries);
      return entries;
    },
    placeholderData: queryClient.getQueryData<Record<number, AniDBEpisodeType | null>>(episodePlaceholderKey) ?? {},
    enabled,
  });
};
