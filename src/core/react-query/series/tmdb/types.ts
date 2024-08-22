import type { PaginationType } from '@/core/types/api';

export type TmdbEpisodeXRefRequestType = {
  tmdbShowID?: number;
} & PaginationType;
