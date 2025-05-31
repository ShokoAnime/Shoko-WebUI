import React, { useMemo, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router';
import { mdiCogOutline, mdiLoading, mdiOpenInNew, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce, every, filter, forEach, get, groupBy, isEqual, map, reduce, some, toNumber } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import EpisodeRow from '@/components/Collection/Tmdb/EpisodeRow';
import MovieRow from '@/components/Collection/Tmdb/MovieRow';
import TmdbLinkSelectPanel from '@/components/Collection/Tmdb/TmdbLinkSelectPanel';
import TopPanel from '@/components/Collection/Tmdb/TopPanel';
import TmdbShowSettingsModal from '@/components/Dialogs/TmdbShowSettingsModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import { IncludeOnlyFilterEnum } from '@/core/react-query/series/types';
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
import { EpisodeTypeEnum, MatchRatingType } from '@/core/types/api/episode';
import useEventCallback from '@/hooks/useEventCallback';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { TmdbEpisodeXrefMappingRequestType } from '@/core/react-query/tmdb/types';
import type { TmdbEpisodeXrefType } from '@/core/types/api/tmdb';

const TmdbLinking = () => {
  const seriesId = toNumber(useParams().seriesId);

  const navigate = useNavigateVoid();
  if (seriesId === 0) {
    navigate('..');
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const type = useMemo(() => searchParams.get('type') ?? null, [searchParams]) as 'Show' | 'Movie' | null;
  const tmdbId = useMemo(() => toNumber(searchParams.get('id')), [searchParams]);

  const seriesQuery = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] }, !!seriesId);

  const [toggledSettingsModal, toggleShowSettingsModal] = useToggle();
  const showSettings = type === 'Show' && tmdbId > 0;

  const [createInProgress, setCreateInProgress] = useState(false);

  const isNewLink = useMemo(() => {
    if (tmdbId === 0 || !type || !seriesQuery.data) return false;
    return !seriesQuery.data.IDs.TMDB[type].includes(tmdbId);
  }, [seriesQuery.data, tmdbId, type]);

  const { fetchNextPage: fetchNextEpisodesPage, ...episodesQuery } = useSeriesEpisodesInfiniteQuery(
    seriesId,
    {
      includeDataFrom: ['AniDB'],
      includeMissing: IncludeOnlyFilterEnum.true,
      includeUnaired: IncludeOnlyFilterEnum.true,
      type: [EpisodeTypeEnum.Normal, EpisodeTypeEnum.Special, EpisodeTypeEnum.Other],
      pageSize: 50,
    },
    !!seriesId,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const episodeXrefsQuery = useTmdbEpisodeXrefsQuery(
    seriesId,
    isNewLink,
    tmdbId,
    !createInProgress && !!seriesId && type === 'Show' && !!seriesQuery.data,
  );
  const episodeXrefs = useMemo(
    () => (episodeXrefsQuery.data
      ? groupBy(episodeXrefsQuery.data, 'AnidbEpisodeID') as Record<string, TmdbEpisodeXrefType[]>
      : undefined),
    [episodeXrefsQuery.data],
  );

  const movieXrefsQuery = useTmdbMovieXrefsQuery(
    seriesId,
    !!seriesId && type === 'Movie' && !!seriesQuery.data,
  );

  const lastPageIds = useMemo(
    () => {
      if (type !== 'Show' || !episodeXrefs || isEqual(episodeXrefs, {})) return [];

      const lastPage = episodesQuery.data?.pages.at(-1);
      if (!lastPage) return [];

      const lastPageAnidbIds = lastPage.List.map(episode => episode.IDs.AniDB);

      return filter(episodeXrefs, xrefs => some(xrefs, xref => lastPageAnidbIds.includes(xref.AnidbEpisodeID)))
        .flatMap(xrefs => map(xrefs, xref => xref.TmdbEpisodeID))
        .filter(tmdbEpisodeId => !!tmdbEpisodeId);
    },
    [episodeXrefs, episodesQuery.data, type],
  );

  const tmdbEpisodesQuery = useTmdbBulkEpisodesQuery(
    { IDs: lastPageIds },
    type === 'Show' && lastPageIds.length > 0,
  );

  const tmdbShowOrMovieQuery = useTmdbShowOrMovieQuery(tmdbId, type!, !!type && tmdbId !== 0);

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const [
    linkOverrides,
    setLinkOverrides,
  ] = useImmer<Record<number, number[]>>({});

  const estimateSize = useEventCallback((index: number) => {
    const episode = episodes[index];
    if (!episode) return 60; // 60px is the minimum height of a loaded row.
    return 60 * (linkOverrides[episode.IDs.AniDB]?.length || 1);
  });

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize,
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

  const movieXrefCount = useMemo(
    () => {
      if (!movieXrefsQuery.data) return 0;

      const tempXrefs: Record<number, number> = Object.fromEntries(
        map(
          filter(movieXrefsQuery.data, xref => xref.TmdbMovieID === tmdbId),
          xref => [xref.AnidbEpisodeID, xref.TmdbMovieID],
        ),
      );

      forEach(linkOverrides, (overrideIds, episodeId) => {
        // The rule makes it unreadable....
        // eslint-disable-next-line  @typescript-eslint/prefer-destructuring
        tempXrefs[toNumber(episodeId)] = overrideIds[0];
      });

      return Object.keys(tempXrefs).filter(key => tempXrefs[key] !== 0).length;
    },
    [linkOverrides, movieXrefsQuery.data, tmdbId],
  );

  // Overrides merged with episodeXrefs
  const finalEpisodeXrefs = useMemo(() => {
    if (!episodeXrefs || !seriesQuery.data) return undefined;

    const tempXrefs: Record<number, TmdbEpisodeXrefType[]> = { ...episodeXrefs };

    forEach(linkOverrides, (overrideIds, anidbEpisodeId) => {
      const episodeId = toNumber(anidbEpisodeId);
      tempXrefs[episodeId] = [];
      forEach(overrideIds, (overrideId, index) => {
        tempXrefs[episodeId].push({
          AnidbAnimeID: seriesQuery.data.IDs.AniDB,
          AnidbEpisodeID: episodeId,
          TmdbShowID: tmdbId,
          TmdbEpisodeID: overrideId,
          Index: index,
          Rating: MatchRatingType.UserVerified,
        });
      });
    });

    return tempXrefs;
  }, [episodeXrefs, linkOverrides, seriesQuery.data, tmdbId]);

  const { mutateAsync: addLink } = useTmdbAddLinkMutation(seriesId, type ?? 'Show');
  const { mutateAsync: editEpisodeLinks } = useTmdbEditEpisodeXrefsMutation(seriesId);
  const { mutateAsync: deleteLink } = useDeleteTmdbLinkMutation(seriesId, type ?? 'Show');
  const { mutateAsync: createAutoLinks } = useTmdbAddAutoXrefsMutation(seriesId);

  const createEpisodeLinks = useEventCallback(async () => {
    setCreateInProgress(true);
    try {
      // If we're not giving the server any clues about which series to link
      // then we need to first create the auto links before sending the
      // mappings.
      if (
        isNewLink
        && (Object.keys(linkOverrides).length === 0 || every(linkOverrides, links => every(links, link => link === 0)))
      ) {
        await createAutoLinks({ tmdbShowID: tmdbId });
      }

      if (Object.keys(linkOverrides).length > 0) {
        const set = new Set<string>();
        const newMappings = reduce(
          linkOverrides,
          (result, overrides, episodeId) => {
            forEach(overrides, (overrideId, index) => {
              if (index > 0 && overrideId === 0) return;
              result.push({
                AniDBID: toNumber(episodeId),
                TmdbID: overrideId,
                // Replace is used when we link multiple anidb episodes to a single tmdb episode.
                Replace: !set.has(episodeId) ? Boolean(set.add(episodeId)) : false,
              });
            });
            return result;
          },
          [] as TmdbEpisodeXrefMappingRequestType[],
        );

        await editEpisodeLinks({
          ResetAll: false,
          Mapping: newMappings,
        });
      }

      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      if (isNewLink) {
        toast.success(
          'Series has been linked and TMDB related tasks for data and images have been added to the queue!',
        );
      } else {
        toast.success('Episode links have been updated!');
      }
      // Note: The tmdb linking page's parent is the collection page, so we need to navigate from the collection page to the series page, even though we use the series id on the tmdb linking page too.
      navigate(`../series/${seriesId}`);
    } catch (_) {
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  });

  const createMovieLinks = useEventCallback(async () => {
    setCreateInProgress(true);
    try {
      const linkGroups = reduce(
        linkOverrides,
        (result, overrideIds, episodeId) => {
          if (overrideIds[0]) result.create.push(toNumber(episodeId));
          else result.delete.push(toNumber(episodeId));
          return result;
        },
        { create: [] as number[], delete: [] as number[] },
      );

      const deleteLinkMutations = linkGroups.delete?.map(
        episodeId => deleteLink({ ID: tmdbId, EpisodeID: episodeId }),
      ) ?? [];
      await Promise.all(deleteLinkMutations);

      const newLinkMutations = linkGroups.create?.map(
        episodeId => addLink({ ID: tmdbId, EpisodeID: episodeId }),
      );
      await Promise.all(newLinkMutations);

      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      toast.success('Links saved!');
      // Note: The tmdb linking page's parent is the collection page, so we need to navigate from the collection page to the series page, even though we use the series id on the tmdb linking page too.
      navigate(`../series/${seriesId}`);
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

    createEpisodeLinks().catch(console.error);
  });

  const disableCreateLink = useMemo(() => {
    if (type === 'Movie') {
      return Object.keys(linkOverrides).length === 0;
    }

    if (isNewLink) return false;

    return Object.keys(linkOverrides).length === 0;
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
        xrefs={type === 'Show' ? finalEpisodeXrefs : undefined}
        xrefsCount={type === 'Show' ? undefined : movieXrefCount}
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
              <div className="shrink-0">
                AniDB |&nbsp;
              </div>
              <a
                className="flex cursor-pointer font-semibold text-panel-text-primary"
                href={`https://anidb.net/anime/${seriesQuery.data.IDs.AniDB}`}
                target="_blank"
                rel="noopener noreferrer"
                data-tooltip-id="tooltip"
                data-tooltip-content={seriesQuery.data.Name}
              >
                <div className="shrink-0">
                  {seriesQuery.data.IDs.AniDB}
                  &nbsp;-&nbsp;
                </div>

                <div className="line-clamp-1">
                  {seriesQuery.data.Name}
                </div>

                <div className="ml-2 shrink-0">
                  <Icon path={mdiOpenInNew} size={1} />
                </div>
              </a>
            </div>

            {type === 'Show' && <div />}

            {tmdbId !== 0
              ? (
                <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                  {tmdbShowOrMovieQuery.data && (
                    <>
                      <div className="flex grow items-center">
                        <div className="shrink-0">
                          TMDB |&nbsp;
                        </div>
                        <a
                          className="flex cursor-pointer font-semibold text-panel-text-primary"
                          href={`https://www.themoviedb.org/${type === 'Show' ? 'tv' : 'movie'}/${tmdbId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={tmdbShowOrMovieQuery.data.Title}
                        >
                          <div className="shrink-0">
                            {tmdbId}
                            &nbsp;-&nbsp;
                          </div>

                          <div className="line-clamp-1">
                            {tmdbShowOrMovieQuery.data.Title}
                          </div>

                          <div className="ml-2 shrink-0">
                            <Icon path={mdiOpenInNew} size={1} />
                          </div>
                        </a>
                        <div className="grow" />
                        <div className="shrink-0">
                          {showSettings
                            ? (
                              <>
                                <TmdbShowSettingsModal
                                  show={toggledSettingsModal}
                                  showId={tmdbId}
                                  onClose={toggleShowSettingsModal}
                                />
                                <Button onClick={toggleShowSettingsModal} tooltip="Open Settings">
                                  <Icon className="text-panel-icon-action" path={mdiCogOutline} size={1} />
                                </Button>
                              </>
                            )
                            : null}
                        </div>
                      </div>
                      {isNewLink && (
                        <Button
                          className="text-panel-text-primary"
                          onClick={handleNewLinkEdit}
                          tooltip="Edit Link"
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
              : <TmdbLinkSelectPanel seriesType={seriesQuery.data?.AniDB?.Type} />}

            <div
              className={cx(
                'relative w-full',
                type === 'Movie' ? 'col-span-2' : 'col-span-3',
                tmdbId === 0 && '!col-span-1',
              )}
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualItem) => {
                const episode = get(episodes, virtualItem.index, undefined);
                const isOdd = virtualItem.index % 2 === 1;

                if (!episode && !episodesQuery.isFetchingNextPage) fetchNextPageDebounced();

                const overrides = episode
                  ? (linkOverrides[episode.IDs.AniDB] ?? finalEpisodeXrefs?.[episode.IDs.AniDB] ?? [0])
                  : [0];

                const existingXrefs = episode
                  ? episodeXrefs?.[episode.IDs.AniDB]?.map(xref => xref.TmdbEpisodeID)
                  : undefined;

                return (
                  <div
                    className={cx(
                      'absolute left-0 top-0 flex w-full gap-x-2',
                      episode && type === 'Show' && 'flex-col gap-y-2',
                    )}
                    style={{
                      transform: `translateY(${virtualItem.start ?? 0}px)`,
                    }}
                    key={episode?.IDs.ID ?? `loading-${virtualItem.key}`}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualItem.index}
                  >
                    {episode && type === 'Show' && (
                      map(
                        overrides,
                        (_, index) => (
                          <div
                            key={`episode-${episode.IDs.AniDB}-${index}`}
                            className="relative left-0 top-0 flex w-full gap-x-2"
                          >
                            <EpisodeRow
                              episode={episode}
                              offset={index}
                              isOdd={isOdd}
                              setLinkOverrides={setLinkOverrides}
                              tmdbEpisodesPending={lastPageIds.length > 0 && tmdbEpisodesQuery.isPending}
                              existingXrefs={existingXrefs}
                              xrefs={finalEpisodeXrefs}
                            />
                          </div>
                        ),
                      )
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
                        {type === 'Show' && (
                          <div
                            className={cx(
                              'w-16 rounded-lg border border-panel-border',
                              isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
                            )}
                          />
                        )}
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
