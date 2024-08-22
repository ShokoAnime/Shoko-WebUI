import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { mdiLoading, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce, toNumber } from 'lodash';

import EpisodeRow from '@/components/Collection/Tmdb/EpisodeRow';
import TopPanel from '@/components/Collection/Tmdb/TopPanel';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import {
  useTmdbEpisodeXRefsInfiniteQuery,
  useTmdbMovieXrefsQuery,
  useTmdbShowOrMovieQuery,
} from '@/core/react-query/tmdb/queries';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { TmdbEpisodeXRefType } from '@/core/types/api/tmdb';

const SeriesTmdbLinking = () => {
  const { seriesId, tmdbId: fullTmdbId } = useParams();
  const navigate = useNavigate();

  if (!seriesId) {
    navigate('..');
  }

  const [tmdbId, type] = useMemo<[number, 'tv' | 'movie' | null]>(
    () => {
      if (!fullTmdbId) return [0, null];
      const tmdbType = fullTmdbId.startsWith('s') ? 'tv' : 'movie';
      const id = toNumber(fullTmdbId.slice(1));
      return [id, tmdbType];
    },
    [fullTmdbId],
  );

  const seriesQuery = useSeriesQuery(toNumber(seriesId!), {}, !!seriesId);

  const {
    data: episodesData,
    fetchNextPage,
    isFetchingNextPage,
    isPending: episodesIsPending,
    isSuccess: episodesIsSuccess,
  } = useSeriesEpisodesInfiniteQuery(
    toNumber(seriesId!),
    {
      includeDataFrom: ['AniDB', 'TMDB'],
      type: [EpisodeTypeEnum.Normal, EpisodeTypeEnum.Special, EpisodeTypeEnum.Other],
      pageSize: 50,
    },
    !!seriesId,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesData);

  const episodeXrefsQuery = useTmdbEpisodeXRefsInfiniteQuery(
    toNumber(seriesId!),
    { tmdbShowID: tmdbId, pageSize: 0 },
    !!seriesId && type === 'tv',
  );
  const [episodeXrefs] = useFlattenListResult<TmdbEpisodeXRefType>(episodeXrefsQuery.data);

  const movieXrefsQuery = useTmdbMovieXrefsQuery(
    toNumber(seriesId!),
    !!seriesId && type === 'movie',
  );

  const xrefs = useMemo(
    () => (type === 'tv' ? episodeXrefs : movieXrefsQuery.data ?? []),
    [episodeXrefs, movieXrefsQuery.data, type],
  );

  const tmdbShowOrMovieQuery = useTmdbShowOrMovieQuery(tmdbId, type!, !!type && tmdbId !== 0);

  const isPending = useMemo(
    () =>
      seriesQuery.isPending
      || episodesIsPending
      || tmdbShowOrMovieQuery.isPending
      || (type === 'tv' && episodeXrefsQuery.isPending)
      || (type === 'movie' && movieXrefsQuery.isPending),
    [
      seriesQuery.isPending,
      episodesIsPending,
      tmdbShowOrMovieQuery.isPending,
      type,
      episodeXrefsQuery.isPending,
      movieXrefsQuery.isPending,
    ],
  );

  const isSuccess = useMemo(
    () =>
      seriesQuery.isSuccess
      && episodesIsSuccess
      && tmdbShowOrMovieQuery.isSuccess
      && (type === 'movie' || episodeXrefsQuery.isSuccess)
      && (type === 'tv' || movieXrefsQuery.isSuccess),
    [
      seriesQuery.isSuccess,
      episodesIsSuccess,
      tmdbShowOrMovieQuery.isSuccess,
      type,
      episodeXrefsQuery.isSuccess,
      movieXrefsQuery.isSuccess,
    ],
  );

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56, // 56px is the minimum height of a loaded row,
    overscan: 5,
    gap: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextPage().catch(() => {});
      }, 100),
    [fetchNextPage],
  );

  return (
    <div className="flex grow flex-col gap-y-6">
      <TopPanel seriesId={seriesId ?? '0'} xrefs={xrefs} xrefsCount={xrefs.length} />
      <div className="flex grow flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
        {isPending && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {isSuccess && (
          <>
            <div className="mb-2 flex w-full items-start gap-x-2">
              <div className="flex grow basis-0 items-center rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                AniDB |&nbsp;
                <a
                  className="flex cursor-pointer font-semibold text-panel-text-primary"
                  href={`https://anidb.net/anime/${seriesQuery.data?.IDs.AniDB}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {seriesQuery.data?.IDs.AniDB}
                  &nbsp;-&nbsp;
                  {seriesQuery.data?.Name}
                  <Icon path={mdiOpenInNew} size={1} className="ml-2" />
                </a>
              </div>
              {type === 'tv' && <div className="w-14" />}
              <div className="flex grow basis-0 items-center rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                TMDB |&nbsp;
                <a
                  className="flex cursor-pointer font-semibold text-panel-text-primary"
                  href={`https://www.themoviedb.org/${type}/${tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tmdbId}
                  &nbsp;-&nbsp;
                  {tmdbShowOrMovieQuery.data?.Title}
                  <Icon path={mdiOpenInNew} size={1} className="ml-2" />
                </a>
              </div>
            </div>

            <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
              {virtualItems.map((virtualItem) => {
                const episode = episodes[virtualItem.index];

                if (!episode && !isFetchingNextPage) fetchNextPageDebounced();

                return (
                  <div
                    className="absolute left-0 top-0 flex w-full gap-x-2"
                    style={{
                      transform: `translateY(${virtualItem.start ?? 0}px)`,
                    }}
                    key={episode?.IDs.ID ?? `loading-${virtualItem.key}`}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualItem.index}
                  >
                    {episode
                      ? (
                        <EpisodeRow
                          episode={episode}
                          xrefs={xrefs}
                          type={type}
                          isOdd={virtualItem.index % 2 === 1}
                        />
                      )
                      : (
                        (
                          <>
                            <div className="flex grow basis-0 items-center justify-center rounded-lg border border-panel-border bg-panel-background-alt p-4 text-panel-text-primary">
                              <Icon path={mdiLoading} spin size={1} />
                            </div>
                            {type === 'tv' && <div className="w-14" />}
                            <div className="flex grow basis-0 items-center justify-center rounded-lg border border-panel-border bg-panel-background-alt p-4 text-panel-text-primary">
                              <Icon path={mdiLoading} spin size={1} />
                            </div>
                          </>
                        )
                      )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeriesTmdbLinking;
