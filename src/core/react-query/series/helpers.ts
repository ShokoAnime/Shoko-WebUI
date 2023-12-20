import type { SeriesEpisodesInfiniteRequestType } from '@/core/react-query/series/types';
import type { FileRequestType } from '@/core/react-query/types';

export const getSeriesEpisodesQueryKey = (
  seriesId: number,
  params: SeriesEpisodesInfiniteRequestType,
) => ['series', 'episodes', seriesId, params];

export const getSeriesFilesQueryKey = (
  seriesId: number,
  params: FileRequestType,
) => ['series', 'files', seriesId, params];
