import { transformListResultSimplified } from '@/core/react-query/helpers';

import type { ListResultType } from '@/core/types/api';
import type { TmdbEpisodeXrefType } from '@/core/types/api/tmdb';

export const cleanTmdbEpisodeXrefs = (xrefs: ListResultType<TmdbEpisodeXrefType>) =>
  transformListResultSimplified(xrefs).filter(xref => xref.TmdbEpisodeID !== null);
