import { useQuery } from '@tanstack/react-query';

import { axios } from '@/core/axios';
import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { FileRequestType } from '@/core/react-query/types';
import type { ListResultType } from '@/core/types/api';
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
