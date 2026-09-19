import { useMemo, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router';
import { mdiLoading, mdiOpenInNew, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce, every, find, forEach, groupBy, map, reduce, toNumber } from 'lodash';
import { useImmer } from 'use-immer';

import AnilistLinkSelectPanel from '@/components/Collection/Anilist/AnilistLinkSelectPanel';
import EpisodeRow from '@/components/Collection/Anilist/EpisodeRow';
import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import TopPanel from '@/components/Collection/Tmdb/TopPanel';
import Button from '@/components/Input/Button';
import {
  useAnilistAddAutoXrefsMutation,
  useAnilistEditEpisodeXrefsMutation,
  useAnilistResetEpisodeXrefsMutation,
} from '@/core/react-query/anilist/mutations';
import {
  useAnilistAnimeAllEpisodesQuery,
  useAnilistAnimeQuery,
  useAnilistEpisodeXrefsQuery,
} from '@/core/react-query/anilist/queries';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import toast from '@/core/toast';
import { getAnidbAnimeLink, getAnilistAnimeLink } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { AnilistEpisodeXrefMappingRequestType } from '@/core/react-query/anilist/types';
import type { AnilistEpisodeXrefType } from '@/core/types/api/anilist';

const AnilistLinking = () => {
  const seriesId = toNumber(useParams().seriesId);

  const navigate = useNavigateVoid();
  if (seriesId === 0) {
    navigate('..');
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const anilistId = useMemo(() => toNumber(searchParams.get('id')), [searchParams]);

  const seriesQuery = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] }, !!seriesId);

  const [createInProgress, setCreateInProgress] = useState(false);

  const isNewLink = useMemo(() => {
    if (anilistId === 0 || !seriesQuery.data) return false;
    return !seriesQuery.data.IDs.AniList.includes(anilistId);
  }, [anilistId, seriesQuery.data]);

  const episodesQuery = useSeriesEpisodesInfiniteQuery(
    seriesId,
    {
      includeDataFrom: ['AniDB'],
      includeMissing: 'true',
      includeUnaired: 'true',
      type: ['Episode', 'Special', 'Other'],
      pageSize: 50,
    },
    !!seriesId,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const episodeXrefsQuery = useAnilistEpisodeXrefsQuery(
    seriesId,
    isNewLink,
    anilistId,
    !createInProgress && !!seriesId && anilistId !== 0 && !!seriesQuery.data,
  );
  const episodeXrefs = useMemo(
    () => (episodeXrefsQuery.data
      ? groupBy(episodeXrefsQuery.data, 'AnidbEpisodeID') as Record<string, AnilistEpisodeXrefType[]>
      : undefined),
    [episodeXrefsQuery.data],
  );

  const anilistEpisodesQuery = useAnilistAnimeAllEpisodesQuery(anilistId, anilistId !== 0);

  const anilistAnimeQuery = useAnilistAnimeQuery(anilistId, {}, anilistId !== 0);

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const [
    linkOverrides,
    setLinkOverrides,
  ] = useImmer<Record<number, number[]>>({});

  const estimateSize = (index: number) => {
    const episode = episodes[index];
    if (!episode) return 60; // 60px is the minimum height of a loaded row.
    return 60 * (linkOverrides[episode.IDs.AniDB]?.length || 1);
  };

  const rowVirtualizer = useVirtualizer({
    count: episodeCount,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    initialOffset: () => scrollRef.current?.scrollTop ?? 0,
    overscan: 10,
    gap: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  const fetchNextPageDebounced = useMemo(
    () =>
      debounce(() => {
        episodesQuery.fetchNextPage().catch(console.error);
      }, 100),
    [episodesQuery],
  );

  // Overrides merged with episodeXrefs
  const finalEpisodeXrefs = useMemo(() => {
    if (!episodeXrefs || !seriesQuery.data) return undefined;

    const tempXrefs: Record<number, AnilistEpisodeXrefType[]> = { ...episodeXrefs };

    forEach(linkOverrides, (overrideIds, anidbEpisodeId) => {
      const episodeId = toNumber(anidbEpisodeId);
      tempXrefs[episodeId] = [];
      forEach(overrideIds, (overrideId, index) => {
        tempXrefs[episodeId].push({
          AnidbAnimeID: seriesQuery.data.IDs.AniDB,
          AnidbEpisodeID: episodeId,
          AnilistAnimeID: anilistId,
          AnilistEpisodeID: overrideId,
          EpisodeNumber: find(anilistEpisodesQuery.data, { ID: overrideId })?.EpisodeNumber ?? 0,
          Index: index,
          Rating: 'UserVerified',
        });
      });
    });

    return tempXrefs;
  }, [anilistEpisodesQuery.data, anilistId, episodeXrefs, linkOverrides, seriesQuery.data]);

  const { mutateAsync: editEpisodeLinks } = useAnilistEditEpisodeXrefsMutation(seriesId);
  const { mutateAsync: createAutoLinks } = useAnilistAddAutoXrefsMutation(seriesId);
  const { mutateAsync: resetEpisodeLinks } = useAnilistResetEpisodeXrefsMutation(seriesId);

  const createEpisodeLinks = async () => {
    setCreateInProgress(true);
    try {
      // If we're not giving the server any clues about which anime to link
      // then we need to first create the auto links before sending the
      // mappings.
      if (
        isNewLink
        && (Object.keys(linkOverrides).length === 0 || every(linkOverrides, links => every(links, link => link === 0)))
      ) {
        await createAutoLinks({ AnilistAnimeID: anilistId });
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
                AnilistID: overrideId,
                // Replace is used when we link multiple anidb episodes to a single anilist episode.
                Replace: !set.has(episodeId) ? Boolean(set.add(episodeId)) : false,
              });
            });
            return result;
          },
          [] as AnilistEpisodeXrefMappingRequestType[],
        );

        await editEpisodeLinks({
          UnsetAll: false,
          Mapping: newMappings,
        });
      }

      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      if (isNewLink) {
        toast.success(
          'Series has been linked and AniList related tasks for data and images have been added to the queue!',
        );
      } else {
        toast.success('Episode links have been updated!');
      }
      // Note: The anilist linking page's parent is the collection page, so we need to navigate from the collection page to the series page, even though we use the series id on the anilist linking page too.
      navigate(`../series/${seriesId}`);
    } catch (_) {
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  };

  const resetLinks = async () => {
    setCreateInProgress(true);
    try {
      await resetEpisodeLinks();
      await createAutoLinks({ AnilistAnimeID: anilistId, KeepExisting: false });
      resetQueries(['series', seriesId]);
      setLinkOverrides({});
      toast.success('Episode links have been reset!');
    } catch (_) {
      toast.error('Failed to reset links!');
    }
    setCreateInProgress(false);
  };

  const handleCreateLink = () => {
    createEpisodeLinks().catch(console.error);
  };

  const handleResetLinks = () => {
    resetLinks().catch(console.error);
  };

  const disableCreateLink = useMemo(() => {
    if (isNewLink) return false;

    return Object.keys(linkOverrides).length === 0;
  }, [isNewLink, linkOverrides]);

  const handleNewLinkEdit = () => {
    setSearchParams({});
    setLinkOverrides({});
  };

  return (
    <div className="flex grow flex-col gap-y-6">
      <TopPanel
        createInProgress={createInProgress}
        disableCreateLink={disableCreateLink}
        handleCreateLink={handleCreateLink}
        handleResetLinks={anilistId !== 0 && !!seriesQuery.data && !isNewLink ? handleResetLinks : undefined}
        seriesId={seriesId}
        xrefs={finalEpisodeXrefs}
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
              'grid grid-rows-[auto_minmax(0,1fr)] gap-2',
              anilistId !== 0 ? 'grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)]' : 'grid-cols-2',
            )}
          >
            <div className="flex items-center rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
              <div className="shrink-0">
                AniDB |&nbsp;
              </div>
              <a
                className="flex cursor-pointer font-semibold text-panel-text-primary"
                href={getAnidbAnimeLink(seriesQuery.data.IDs.AniDB)}
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

                <div className="mx-1 shrink-0">
                  <Icon path={mdiOpenInNew} size={1} />
                </div>
              </a>
            </div>

            {anilistId !== 0 && <div />}

            {anilistId !== 0
              ? (
                <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                  {anilistAnimeQuery.data && (
                    <>
                      <div className="flex grow items-center">
                        <div className="shrink-0">
                          AniList |&nbsp;
                        </div>
                        <a
                          className="flex cursor-pointer font-semibold text-panel-text-primary"
                          href={getAnilistAnimeLink(anilistId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={anilistAnimeQuery.data.Title}
                        >
                          <div className="shrink-0">
                            {anilistId}
                            &nbsp;-&nbsp;
                          </div>

                          <div className="line-clamp-1">
                            {anilistAnimeQuery.data.Title}
                          </div>

                          <div className="mx-1 shrink-0">
                            <Icon path={mdiOpenInNew} size={1} />
                          </div>
                        </a>
                        <div className="grow" />
                      </div>
                      {isNewLink && (
                        <Button
                          className="ml-1 text-panel-text-primary"
                          onClick={handleNewLinkEdit}
                          tooltip="Edit Link"
                        >
                          <Icon path={mdiPencilCircleOutline} size={1} />
                        </Button>
                      )}
                    </>
                  )}

                  {anilistAnimeQuery.isPending && (
                    <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
                  )}
                </div>
              )
              : <AnilistLinkSelectPanel />}

            <div
              className={cx(
                'relative w-full',
                anilistId === 0 ? 'col-span-1' : 'col-span-3',
              )}
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualItem) => {
                const episode = episodes[virtualItem.index];
                const isOdd = virtualItem.index % 2 === 1;

                if (!episode && !episodesQuery.isFetchingNextPage) fetchNextPageDebounced();

                const overrides = episode
                  ? (linkOverrides[episode.IDs.AniDB] ?? finalEpisodeXrefs?.[episode.IDs.AniDB] ?? [0])
                  : [0];

                const existingXrefs = episode
                  ? episodeXrefs?.[episode.IDs.AniDB]?.map(xref => xref.AnilistEpisodeID)
                  : undefined;

                return (
                  <div
                    className={cx(
                      'absolute top-0 left-0 flex w-full gap-x-2',
                      episode && anilistId !== 0 && 'flex-col gap-y-2',
                    )}
                    style={{
                      transform: `translateY(${virtualItem.start ?? 0}px)`,
                    }}
                    key={episode?.IDs.ID ?? `loading-${virtualItem.key}`}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualItem.index}
                  >
                    {episode && anilistId !== 0 && (
                      map(
                        overrides,
                        (_, index) => (
                          <div
                            key={`episode-${episode.IDs.AniDB}-${index}`}
                            className="relative top-0 left-0 grid w-full grid-cols-[1fr_auto_1fr] gap-x-2"
                          >
                            <EpisodeRow
                              anilistEpisodes={anilistEpisodesQuery.data}
                              anilistEpisodesPending={anilistEpisodesQuery.isPending}
                              episode={episode}
                              offset={index}
                              isOdd={isOdd}
                              setLinkOverrides={setLinkOverrides}
                              existingXrefs={existingXrefs}
                              xrefs={finalEpisodeXrefs}
                            />
                          </div>
                        ),
                      )
                    )}

                    {/* To render only anidb episodes (left panel) for new links */}
                    {episode && anilistId === 0 && <AniDBEpisode episode={episode} isOdd={isOdd} />}

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
                        {anilistId !== 0 && (
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

export default AnilistLinking;
