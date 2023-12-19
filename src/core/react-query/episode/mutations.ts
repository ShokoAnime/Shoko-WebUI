import { useMutation } from '@tanstack/react-query';
import { forEach } from 'lodash';

import { axios } from '@/core/axios';
import queryClient, { invalidateQueries } from '@/core/react-query/queryClient';

import type { HideEpisodeRequestType, WatchEpisodeRequestType } from '@/core/react-query/episode/types';
import type { ListResultType } from '@/core/types/api';
import type { EpisodeType } from '@/core/types/api/episode';
import type { InfiniteData } from '@tanstack/react-query';

export const useHideEpisodeMutation = () =>
  useMutation({
    mutationFn: ({ episodeId, hidden }: HideEpisodeRequestType) =>
      axios.post(
        `Episode/${episodeId}/SetHidden`,
        null,
        {
          params: {
            value: hidden,
            updateStats: true,
          },
        },
      ),
    onSuccess: () => {
      invalidateQueries(['series', 'single']);
      invalidateQueries(['series', 'episodes']);
    },
  });

export const useWatchEpisodeMutation = (pageNumber: number) =>
  useMutation({
    mutationKey: ['episode', 'watched'],
    mutationFn: ({ episodeId, watched }: WatchEpisodeRequestType) =>
      axios.post(`Episode/${episodeId}/Watched/${watched}`),
    onSuccess: async (_, { episodeId }) => {
      invalidateQueries(['series', 'single']);

      const [[queryKey]] = queryClient.getQueriesData({
        queryKey: ['series', 'episodes'],
        type: 'active',
      });

      const newEpisodeData = await queryClient.fetchQuery<EpisodeType>({
        queryKey: ['episode', episodeId],
        queryFn: () => axios.get(`Episode/${episodeId}`),
      });

      queryClient.setQueryData(queryKey, (data: InfiniteData<ListResultType<EpisodeType>>) => {
        const { pageParams, pages } = data;
        forEach(
          pages[pageNumber - 1].List,
          episode => episode.IDs.ID === episodeId && Object.assign(episode, newEpisodeData),
        );
        return { pageParams, pages };
      });
    },
  });
