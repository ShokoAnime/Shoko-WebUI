import { splitV3Api } from '../splitV3Api';

import type { EpisodeAniDBType, EpisodeTvDBType, EpisodeType } from '@/core/types/api/episode';
import { FileType } from '@/core/types/api/file';
import { DataSourceType } from '@/core/types/api/common';

type EpisodeFilesQuery = {
  episodeId: string;
  includeDataFrom?: DataSourceType[];
  includeXRefs?: boolean;
  isManuallyLinked?: boolean;
  includeMediaInfo?: boolean;
};

type EpisodeQuery = {
  episodeId: string;
  includeDataFrom?: DataSourceType[];
};

const episodeApi = splitV3Api.injectEndpoints({
  endpoints: build => ({
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeAnidb: build.query<EpisodeAniDBType, number>({
      query: episodeId => ({ url: `Episode/${episodeId}/AniDB` }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisode: build.query<EpisodeType, EpisodeQuery>({
      query: ({ episodeId, ...params }) => ({ url: `Episode/${episodeId}`, params }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Episode.AniDB entry for the given episodeID.
    getEpisodeTvdb: build.query<EpisodeTvDBType[], number>({
      query: episodeId => ({ url: `Episode/${episodeId}/TvDB` }),
    }),
    // Get the Shoko.Server.API.v3.Models.Shoko.Files for the Shoko.Server.API.v3.Models.Shoko.Episode with the given episodeID.
    getEpisodeFiles: build.query<FileType[], EpisodeFilesQuery>({
      query: ({ episodeId, ...params }) => ({ url: `Episode/${episodeId}/File`, params }),
    }),
  }),
});

export const {
  useGetEpisodeAnidbQuery,
  useGetEpisodeQuery,
  useGetEpisodeTvdbQuery,
  useLazyGetEpisodeFilesQuery,
} = episodeApi;
