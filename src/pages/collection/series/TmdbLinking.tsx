import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { mdiLoading, mdiOpenInNew, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce, map, reduce, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import EpisodeRow from '@/components/Collection/Tmdb/EpisodeRow';
import MovieRow from '@/components/Collection/Tmdb/MovieRow';
import TmdbLinkSelectPanel from '@/components/Collection/Tmdb/TmdbLinkSelectPanel';
import TopPanel from '@/components/Collection/Tmdb/TopPanel';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import {
  useDeleteTmdbLinkMutation,
  useTmdbAddAutoXrefsMutation,
  useTmdbAddLinkMutation,
  useTmdbEditEpisodeXrefsMutation,
} from '@/core/react-query/tmdb/mutations';
import {
  useTmdbBulkEpisodesQuery,
  useTmdbEpisodeXrefsQuery,
  useTmdbMovieXrefsQuery,
  useTmdbShowOrMovieQuery,
} from '@/core/react-query/tmdb/queries';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { SeriesContextType } from '@/components/Collection/constants';

const TmdbLinking = () => {
  const seriesId = toNumber(useParams().seriesId);

  const navigate = useNavigate();
  if (seriesId === 0) {
    navigate('..');
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const type = useMemo(() => searchParams.get('type') ?? null, [searchParams]) as 'Show' | 'Movie' | null;
  const tmdbId = useMemo(() => toNumber(searchParams.get('id')), [searchParams]);

  const seriesQuery = useSeriesQuery(seriesId, {}, !!seriesId);

  const isNewLink = useMemo(() => {
    if (tmdbId === 0 || !type || !seriesQuery.data) return false;
    return !seriesQuery.data.IDs.TMDB[type].includes(tmdbId);
  }, [seriesQuery.data, tmdbId, type]);

  const { fetchNextPage: fetchNextEpisodesPage, ...episodesQuery } = useSeriesEpisodesInfiniteQuery(
    seriesId,
    {
      includeDataFrom: ['AniDB'],
      includeMissing: 'true',
      type: [EpisodeTypeEnum.Normal, EpisodeTypeEnum.Special, EpisodeTypeEnum.Other],
      pageSize: 50,
    },
    !!seriesId,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const episodeXrefsQuery = useTmdbEpisodeXrefsQuery(
    seriesId,
    isNewLink,
    { tmdbShowID: tmdbId, pageSize: 0 },
    !!seriesId && type === 'Show' && !!seriesQuery.data,
  );
  const episodeXrefs = useMemo(() => episodeXrefsQuery.data?.List, [episodeXrefsQuery.data]);

  const movieXrefsQuery = useTmdbMovieXrefsQuery(
    seriesId,
    !!seriesId && type === 'Movie' && !!seriesQuery.data,
  );

  const lastPageIds = useMemo(
    () => {
      if (type !== 'Show' || !episodeXrefs) return [];

      const lastPage = episodesQuery.data?.pages.at(-1);
      if (!lastPage) return [];

      const lastPageAnidbIds = lastPage.List.map(episode => episode.IDs.AniDB);

      return episodeXrefs
        .filter(xref => lastPageAnidbIds.includes(xref.AnidbEpisodeID))
        .map(xref => xref.TmdbEpisodeID)
        .filter(tmdbEpisodeId => !!tmdbEpisodeId) as number[];
    },
    [episodeXrefs, episodesQuery.data, type],
  );

  const tmdbEpisodesQuery = useTmdbBulkEpisodesQuery(
    { IDs: lastPageIds },
    type === 'Show' && lastPageIds.length > 0,
  );

  const tmdbShowOrMovieQuery = useTmdbShowOrMovieQuery(tmdbId, type!, !!type && tmdbId !== 0);

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56, // 56px is the minimum height of a loaded row,
    overscan: 10,
    gap: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        fetchNextEpisodesPage().catch(() => {});
      }, 100),
    [fetchNextEpisodesPage],
  );

  const [
    linkOverrides,
    setLinkOverrides,
  ] = useImmer<Record<number, number>>({});

  useEffect(() => {
    setLinkOverrides({});
  }, [episodes, setLinkOverrides]);

  const finalXrefs = useMemo<Record<number, number>>(
    () => {
      const tempXrefs: Record<number, number> = {};

      const movieXrefs = movieXrefsQuery.data ?? [];
      movieXrefs
        .filter((xref) => {
          if (linkOverrides[xref.AnidbEpisodeID] !== undefined) return linkOverrides[xref.AnidbEpisodeID] === tmdbId;
          return xref.TmdbMovieID === tmdbId;
        })
        .forEach((xref) => {
          tempXrefs[xref.AnidbEpisodeID] = xref.TmdbMovieID;
        });

      const finalLinkOverrides = { ...linkOverrides };
      Object.keys(finalLinkOverrides).forEach((episodeId) => {
        if (linkOverrides[episodeId] === 0) delete finalLinkOverrides[episodeId];
      });

      return { ...tempXrefs, ...finalLinkOverrides };
    },
    [linkOverrides, movieXrefsQuery.data, tmdbId],
  );

  const { mutateAsync: addLink } = useTmdbAddLinkMutation(seriesId, type ?? 'Show');
  const { mutateAsync: editEpisodeLinks } = useTmdbEditEpisodeXrefsMutation(seriesId);
  const { mutateAsync: deleteLink } = useDeleteTmdbLinkMutation(seriesId, type ?? 'Show');
  const { mutateAsync: createAutoLinks } = useTmdbAddAutoXrefsMutation(seriesId);

  const [createInProgress, setCreateInProgress] = useState(false);

  const createLinks = useEventCallback(async () => {
    setCreateInProgress(true);
    try {
      if (isNewLink) {
        await addLink({ ID: tmdbId });
        await createAutoLinks({ tmdbShowID: tmdbId });
      }

      if (Object.keys(linkOverrides).length > 0) {
        // The two commented lines below can be used if we need 1-n mappings
        // const set = new Set<string>();
        await editEpisodeLinks({
          ResetAll: false,
          Mapping: map(linkOverrides, (overrideId, episodeId) => ({
            AniDBID: toNumber(episodeId),
            TmdbID: overrideId,
            Replace: true,
            // Replace: !set.has(episodeId) ? Booelan(set.add(episodeId)) : false,
          })),
        });
      }

      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      toast.success('Links saved!');
    } catch (error) {
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  });

  const createMovieLinks = useEventCallback(async () => {
    setCreateInProgress(true);
    try {
      const linkGroups = reduce(
        linkOverrides,
        (result, overrideId, episodeId) => {
          if (overrideId) result.create.push(toNumber(episodeId));
          else result.delete.push(toNumber(episodeId));
          return result;
        },
        { create: [] as number[], delete: [] as number[] },
      );

      const deleteLinkMutations = linkGroups.delete?.map(
        episodeId => deleteLink({ ID: tmdbId, EpisodeID: toNumber(episodeId) }),
      ) ?? [];
      await Promise.all(deleteLinkMutations);

      const newLinkMutations = linkGroups.create?.map(
        episodeId => addLink({ ID: tmdbId, EpisodeID: toNumber(episodeId) }),
      );
      await Promise.all(newLinkMutations);

      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      toast.success('Links saved!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  });

  const handleCreateLink = useEventCallback(() => {
    if (type === 'Movie') {
      createMovieLinks().catch(console.error);
      return;
    }

    createLinks().catch(console.error);
  });

  const disableCreateLink = useMemo(() => {
    if (type === 'Movie') {
      return Object.keys(linkOverrides).length === 0;
    }
    return Object.keys(linkOverrides).length === 0 && !isNewLink;
  }, [isNewLink, linkOverrides, type]);

  const handleNewLinkEdit = useEventCallback(() => {
    setSearchParams({});
    setLinkOverrides({});
  });

  return (
    <div className="flex grow flex-col gap-y-6">
      <TopPanel
        createInProgress={createInProgress}
        disableCreateLink={disableCreateLink}
        handleCreateLink={handleCreateLink}
        seriesId={seriesId}
        xrefs={type === 'Show' ? episodeXrefs : undefined}
        xrefsCount={type === 'Show' ? episodeXrefs?.length : Object.keys(finalXrefs).length}
      />
      <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background px-4 py-6">
        {(seriesQuery.isPending || episodesQuery.isPending) && (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {(seriesQuery.data && episodesQuery.data) && (
          <div
            className={cx(
              'grid gap-2 grid-rows-[auto_minmax(0,1fr)]',
              type === 'Show' ? 'grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)]' : 'grid-cols-2',
            )}
          >
            <div className="flex items-center rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
              AniDB |&nbsp;
              <a
                className="flex cursor-pointer font-semibold text-panel-text-primary"
                href={`https://anidb.net/anime/${seriesQuery.data.IDs.AniDB}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {seriesQuery.data.IDs.AniDB}
                &nbsp;-&nbsp;
                {seriesQuery.data.Name}
                <Icon path={mdiOpenInNew} size={1} className="ml-2" />
              </a>
            </div>

            {type === 'Show' && <div />}

            {tmdbId !== 0
              ? (
                <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                  {tmdbShowOrMovieQuery.data && (
                    <>
                      <div className="flex items-center">
                        TMDB |&nbsp;
                        <a
                          className="flex cursor-pointer font-semibold text-panel-text-primary"
                          href={`https://www.themoviedb.org/${type === 'Show' ? 'tv' : 'movie'}/${tmdbId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {tmdbId}
                          &nbsp;-&nbsp;
                          {tmdbShowOrMovieQuery.data?.Title}
                          <Icon path={mdiOpenInNew} size={1} className="ml-2" />
                        </a>
                      </div>
                      {isNewLink && (
                        <Button
                          className="text-panel-text-primary"
                          onClick={handleNewLinkEdit}
                        >
                          <Icon path={mdiPencilCircleOutline} size={1} />
                        </Button>
                      )}
                    </>
                  )}

                  {tmdbShowOrMovieQuery.isPending && (
                    <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
                  )}
                </div>
              )
              : <TmdbLinkSelectPanel />}

            <div
              className={cx(
                'relative w-full',
                type === 'Movie' ? 'col-span-2' : 'col-span-3',
                tmdbId === 0 && '!col-span-1',
              )}
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualItem) => {
                const episode = episodes[virtualItem.index];
                const isOdd = virtualItem.index % 2 === 1;

                if (!episode && !episodesQuery.isFetchingNextPage) fetchNextPageDebounced();

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
                    {episode && type === 'Show' && (
                      <EpisodeRow
                        episode={episode}
                        isOdd={isOdd}
                        overrides={linkOverrides}
                        setLinkOverrides={setLinkOverrides}
                        tmdbEpisodesPending={tmdbEpisodesQuery.isPending}
                        xrefs={episodeXrefsQuery.data ? episodeXrefs : undefined}
                      />
                    )}

                    {episode && type === 'Movie' && (
                      <MovieRow
                        episode={episode}
                        isOdd={isOdd}
                        overrides={linkOverrides}
                        setLinkOverrides={setLinkOverrides}
                        xrefs={movieXrefsQuery.data}
                      />
                    )}

                    {/* To render only anidb episodes (left panel) for new links */}
                    {episode && !type && <AniDBEpisode episode={episode} isOdd={isOdd} />}

                    {!episode && (
                      <>
                        <div
                          className={cx(
                            'flex grow justify-center rounded-lg border border-panel-border p-4 text-panel-text-primary',
                            isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
                          )}
                        >
                          <Icon path={mdiLoading} spin size={1} />
                        </div>
                        {type === 'Show' && <div className="w-14" />}
                        <div
                          className={cx(
                            'flex grow justify-center rounded-lg border border-panel-border p-4 text-panel-text-primary',
                            isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
                          )}
                        >
                          <Icon path={mdiLoading} spin size={1} />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TmdbLinking;
