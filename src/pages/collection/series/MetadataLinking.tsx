import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router';
import { mdiCogOutline, mdiLoading, mdiOpenInNew, mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';
import { debounce, every, filter, forEach, groupBy, isEqual, map, reduce, some, toNumber } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import AniDBEpisode from '@/components/Collection/MetadataLinking/AniDBEpisode';
import EpisodeRow from '@/components/Collection/MetadataLinking/EpisodeRow';
import LinkSelectPanel from '@/components/Collection/MetadataLinking/LinkSelectPanel';
import MovieRow from '@/components/Collection/MetadataLinking/MovieRow';
import SourcePicker from '@/components/Collection/MetadataLinking/SourcePicker';
import TopPanel from '@/components/Collection/MetadataLinking/TopPanel';
import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import MetadataSeriesSettingsModal from '@/components/Dialogs/MetadataSeriesSettingsModal';
import Button from '@/components/Input/Button';
import {
  episodePickerParams,
  isLinkableSource,
  isSameKey,
  isSearchableSource,
} from '@/core/react-query/metadata/helpers';
import {
  useSeriesMetadataAddLinkMutation,
  useSeriesMetadataDeleteLinkMutation,
  useSeriesMetadataEditEpisodeLinksMutation,
} from '@/core/react-query/metadata/mutations';
import {
  useMetadataBulkEpisodesQuery,
  useMetadataLinkSourcesQuery,
  useMetadataLookupQuery,
  useMetadataSeriesEpisodesQuery,
  useSeriesMetadataCrossReferencesQuery,
  useSeriesMetadataEpisodeCrossReferencesQuery,
} from '@/core/react-query/metadata/queries';
import { resetQueries } from '@/core/react-query/queryClient';
import { useSeriesEpisodesInfiniteQuery, useSeriesQuery } from '@/core/react-query/series/queries';
import toast from '@/core/toast';
import { getAnidbAnimeLink } from '@/core/util';
import useFlattenListResult from '@/hooks/useFlattenListResult';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { MetadataEpisodeLinkRequestType, MetadataLinkType } from '@/core/react-query/metadata/types';
import type { MetadataCrossReferenceType } from '@/core/types/api/metadata';

const MetadataLinkingContent = ({ source }: { source: string }) => {
  const seriesId = toNumber(useParams().seriesId);

  const navigate = useNavigateVoid();
  if (seriesId === 0) {
    navigate('..');
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const type = useMemo(() => searchParams.get('type') ?? null, [searchParams]) as MetadataLinkType | null;
  const linkType = type ?? 'Show';
  const linkId = searchParams.get('id') ?? '';

  // Episodes are mapped by hand for a linked series that has episodes, for any source. The first page is the one the
  // episode picker starts with, so it is fetched once.
  const linkedEpisodesQuery = useMetadataSeriesEpisodesQuery(
    source,
    linkId,
    episodePickerParams,
    !!source && type === 'Show',
  );
  const showEpisodeMapping = type === 'Show' && (linkedEpisodesQuery.data?.pages[0]?.Total ?? 0) > 0;
  // Only the AniDB episodes are listed before a link is picked, and for a linked series without episodes.
  const showAnidbOnly = !type || (type === 'Show' && !showEpisodeMapping);

  const seriesQuery = useSeriesQuery(seriesId, { includeDataFrom: ['AniDB'] }, !!seriesId);
  const sourcesQuery = useMetadataLinkSourcesQuery();
  const linkableSources = sourcesQuery.data?.filter(isLinkableSource);
  // Picking a source replaces the page in the history, so going back returns to the series.
  const pickSource = useCallback(
    (newSource: string) => setSearchParams({ source: newSource }, { replace: true }),
    [setSearchParams],
  );
  // With only one source to link, there is nothing to pick.
  const onlySource = !source && linkableSources?.length === 1 && isSearchableSource(linkableSources[0])
    ? linkableSources[0].Source
    : undefined;
  useEffect(() => {
    if (onlySource) pickSource(onlySource);
  }, [onlySource, pickSource]);
  const sourceInfo = sourcesQuery.data?.find(item => isSameKey(item.Source, source));
  const sourceName = sourceInfo?.Name ?? source;

  const [showSettingsModal, toggleSettingsModal] = useToggle();
  const showSettings = type === 'Show' && !!linkId;

  const [createInProgress, setCreateInProgress] = useState(false);

  const crossReferencesQuery = useSeriesMetadataCrossReferencesQuery(seriesId, source, !!seriesId && !!source);
  // `undefined` while the series' links are not known, which is not the same as the entry not being linked.
  const isNewLink = useMemo(() => {
    if (!linkId || !type) return false;
    if (!crossReferencesQuery.data) return undefined;
    return !crossReferencesQuery.data.some(xref => xref.EntityType === type && xref.ID === linkId);
  }, [crossReferencesQuery.data, linkId, type]);

  const episodesQuery = useSeriesEpisodesInfiniteQuery(
    seriesId,
    {
      includeDataFrom: ['AniDB'],
      includeMissing: 'true',
      includeUnaired: 'true',
      type: ['Episode', 'Special', 'Other'],
      pageSize: 50,
    },
    !!seriesId && !!source,
  );
  const [episodes, episodeCount] = useFlattenListResult(episodesQuery.data);

  const episodeXrefsQuery = useSeriesMetadataEpisodeCrossReferencesQuery(
    seriesId,
    source,
    isNewLink,
    linkId,
    !createInProgress && !!seriesId && showEpisodeMapping && !!crossReferencesQuery.data,
  );
  const episodeXrefs = useMemo(
    () => (episodeXrefsQuery.data
      ? groupBy(episodeXrefsQuery.data, 'AnidbEpisodeID') as Record<string, MetadataCrossReferenceType[]>
      : undefined),
    [episodeXrefsQuery.data],
  );

  const movieXrefs = useMemo(
    () => crossReferencesQuery.data?.filter(xref => xref.EntityType === 'Movie'),
    [crossReferencesQuery.data],
  );

  const lastPageIds = useMemo(
    () => {
      if (!showEpisodeMapping || !episodeXrefs || isEqual(episodeXrefs, {})) return [];

      const lastPage = episodesQuery.data?.pages.at(-1);
      if (!lastPage) return [];

      const lastPageAnidbIds = lastPage.List.map(episode => episode.IDs.AniDB);

      return filter(
        episodeXrefs,
        xrefs => some(xrefs, xref => !!xref.AnidbEpisodeID && lastPageAnidbIds.includes(xref.AnidbEpisodeID)),
      )
        .flatMap(xrefs => map(xrefs, xref => xref.ID))
        .filter((episodeId): episodeId is string => !!episodeId);
    },
    [episodeXrefs, episodesQuery.data, showEpisodeMapping],
  );

  const linkedBulkEpisodesQuery = useMetadataBulkEpisodesQuery(
    source,
    lastPageIds,
    showEpisodeMapping && lastPageIds.length > 0,
  );

  const linkedEntryQuery = useMetadataLookupQuery(source, linkType, linkId, !!source && !!type);

  const { scrollRef } = useOutletContext<SeriesContextType>();

  const [
    linkOverrides,
    setLinkOverrides,
  ] = useImmer<Record<number, string[]>>({});
  const [
    movieOverrides,
    setMovieOverrides,
  ] = useImmer<Record<number, string>>({});

  const estimateSize = (index: number) => {
    const episode = episodes[index];
    if (!episode) return 60; // 60px is the minimum height of a loaded row.
    return 60 * (linkOverrides[episode.IDs.AniDB]?.length || 1);
  };

  // oxlint-disable-next-line react/incompatible-library -- @tanstack/react-virtual attaches refs during render, which is incompatible with the React Compiler
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

  const movieXrefCount = useMemo(
    () => {
      if (!movieXrefs) return 0;

      const tempXrefs: Record<number, string> = {};
      forEach(movieXrefs, (xref) => {
        if (xref.AnidbEpisodeID && xref.ID === linkId) tempXrefs[xref.AnidbEpisodeID] = linkId;
      });

      forEach(movieOverrides, (overrideId, episodeId) => {
        tempXrefs[toNumber(episodeId)] = overrideId;
      });

      return Object.keys(tempXrefs).filter(key => tempXrefs[key] !== '').length;
    },
    [linkId, movieOverrides, movieXrefs],
  );

  // Overrides merged with episodeXrefs
  const finalEpisodeXrefs = useMemo(() => {
    if (!episodeXrefs || !seriesQuery.data) return undefined;

    const tempXrefs: Record<number, MetadataCrossReferenceType[]> = { ...episodeXrefs };

    forEach(linkOverrides, (overrideIds, anidbEpisodeId) => {
      const episodeId = toNumber(anidbEpisodeId);
      tempXrefs[episodeId] = [];
      forEach(overrideIds, (overrideId, index) => {
        tempXrefs[episodeId].push({
          Source: source,
          EntityType: 'Episode',
          AnidbAnimeID: seriesQuery.data.IDs.AniDB,
          AnidbEpisodeID: episodeId,
          ID: overrideId || null,
          SiteUrl: null,
          ParentID: linkId,
          Index: index,
          MatchRating: 'UserVerified',
        });
      });
    });

    return tempXrefs;
  }, [episodeXrefs, linkId, linkOverrides, seriesQuery.data, source]);

  const { mutateAsync: addLink } = useSeriesMetadataAddLinkMutation(seriesId, source, linkType);
  const { mutateAsync: editEpisodeLinks } = useSeriesMetadataEditEpisodeLinksMutation(seriesId, source);
  const { mutateAsync: deleteLink } = useSeriesMetadataDeleteLinkMutation(seriesId, source, linkType);

  // The linking page's parent is the collection page, so the series page is reached from there, even though the
  // linking page has the series ID too.
  const finishAndReturn = (message: string) => {
    resetQueries(['series', seriesId]);
    toast.success(message);
    navigate(`../series/${seriesId}`);
  };

  const createEpisodeLinks = async () => {
    setCreateInProgress(true);
    try {
      // If we're not giving the server any clues about which series to link
      // then we need to first create the auto links before sending the
      // mappings.
      if (
        isNewLink
        && (Object.keys(linkOverrides).length === 0 || every(linkOverrides, links => every(links, link => !link)))
      ) {
        // Linking a series matches its episodes on the server.
        await addLink({ ID: linkId });
      }

      if (Object.keys(linkOverrides).length > 0) {
        const set = new Set<string>();
        const newMappings = reduce(
          linkOverrides,
          (result, overrides, episodeId) => {
            forEach(overrides, (overrideId, index) => {
              if (index > 0 && !overrideId) return;
              result.push({
                AniDBID: toNumber(episodeId),
                ID: overrideId,
                // The first link of an AniDB episode replaces its others; the rest are added beside it.
                Replace: !set.has(episodeId) ? Boolean(set.add(episodeId)) : false,
              });
            });
            return result;
          },
          [] as MetadataEpisodeLinkRequestType[],
        );

        await editEpisodeLinks({
          UnsetAll: false,
          Mapping: newMappings,
        });
      }

      setLinkOverrides({});
      finishAndReturn(
        isNewLink
          ? `Series has been linked and ${sourceName} related tasks for data and images have been added to the queue!`
          : 'Episode links have been updated!',
      );
    } catch (_) {
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  };

  const createSeriesLink = async () => {
    setCreateInProgress(true);
    try {
      await addLink({ ID: linkId });
      finishAndReturn(`Series has been linked and ${sourceName} related tasks have been added to the queue!`);
    } catch (_) {
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  };

  const createMovieLinks = async () => {
    setCreateInProgress(true);
    try {
      const linkGroups = reduce(
        movieOverrides,
        (result, overrideId, episodeId) => {
          if (overrideId) result.create.push(toNumber(episodeId));
          else result.delete.push(toNumber(episodeId));
          return result;
        },
        { create: [] as number[], delete: [] as number[] },
      );

      const deleteLinkMutations = linkGroups.delete?.map(
        episodeId => deleteLink({ ID: linkId, EpisodeID: episodeId }),
      ) ?? [];
      await Promise.all(deleteLinkMutations);

      const newLinkMutations = linkGroups.create?.map(
        episodeId => addLink({ ID: linkId, EpisodeID: episodeId }),
      );
      await Promise.all(newLinkMutations);

      setMovieOverrides({});
      finishAndReturn('Links saved!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save links!');
    }
    setCreateInProgress(false);
  };

  const handleCreateLink = () => {
    if (type === 'Movie') {
      createMovieLinks().catch(console.error);
      return;
    }

    if (!showEpisodeMapping) {
      createSeriesLink().catch(console.error);
      return;
    }

    createEpisodeLinks().catch(console.error);
  };

  const disableCreateLink = useMemo(() => {
    // Without the series' links it is unknown what saving would change.
    if (!crossReferencesQuery.data) return true;

    if (type === 'Movie') {
      return Object.keys(movieOverrides).length === 0;
    }

    if (isNewLink) return false;

    if (!showEpisodeMapping) return true;

    return Object.keys(linkOverrides).length === 0;
  }, [crossReferencesQuery.data, isNewLink, linkOverrides, movieOverrides, showEpisodeMapping, type]);

  const handleNewLinkEdit = () => {
    setSearchParams({ source });
    setLinkOverrides({});
    setMovieOverrides({});
  };

  return (
    <div className="flex grow flex-col gap-y-6">
      <TopPanel
        createInProgress={createInProgress}
        disableCreateLink={disableCreateLink}
        handleCreateLink={handleCreateLink}
        seriesId={seriesId}
        xrefs={showEpisodeMapping ? finalEpisodeXrefs : undefined}
        xrefsCount={showEpisodeMapping ? undefined : movieXrefCount}
      />
      <div className="flex grow flex-col rounded-lg border border-panel-border bg-panel-background px-4 py-6">
        {!source && (
          <div className="grid grid-cols-2 gap-2">
            <SourcePicker
              linkedIds={seriesQuery.data?.IDs.Linked ?? {}}
              isLoading={!linkableSources || !!onlySource}
              onPick={pickSource}
              sources={linkableSources ?? []}
            />
            <div className="flex items-center justify-center rounded-lg border border-panel-border p-4 opacity-65">
              Pick a source to search it for a series or movie to link.
            </div>
          </div>
        )}

        {!!source
          && (seriesQuery.isPending || episodesQuery.isPending || crossReferencesQuery.isPending
            || linkedEpisodesQuery.isLoading)
          && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

        {!!source && seriesQuery.data && episodesQuery.data && !linkedEpisodesQuery.isLoading && (
          <div
            className={cx(
              'grid grid-rows-[auto_minmax(0,1fr)] gap-2',
              showEpisodeMapping ? 'grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)]' : 'grid-cols-2',
            )}
          >
            <div className="flex items-center rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
              <div className="flex shrink-0 items-center gap-x-2">
                <div className="metadata-link-icon AniDB" />
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

            {showEpisodeMapping && <div />}

            {linkId
              ? (
                <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
                  {linkedEntryQuery.data && (
                    <>
                      <div className="flex grow items-center">
                        <div className="flex shrink-0 items-center gap-x-2">
                          <MetadataSourceIcon key={source} hasIcon={sourceInfo?.HasIcon} source={source} />
                          {sourceName}
                          &nbsp;|&nbsp;
                        </div>
                        <a
                          className={cx(
                            'flex font-semibold text-panel-text-primary',
                            linkedEntryQuery.data.SiteUrl && 'cursor-pointer',
                          )}
                          href={linkedEntryQuery.data.SiteUrl ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-tooltip-id="tooltip"
                          data-tooltip-content={linkedEntryQuery.data.Title}
                        >
                          <div className="shrink-0">
                            {linkId}
                            &nbsp;-&nbsp;
                          </div>

                          <div className="line-clamp-1">
                            {linkedEntryQuery.data.Title}
                          </div>

                          {linkedEntryQuery.data.SiteUrl && (
                            <div className="mx-1 shrink-0">
                              <Icon path={mdiOpenInNew} size={1} />
                            </div>
                          )}
                        </a>
                        <div className="grow" />
                        {showSettings
                          ? (
                            <>
                              <MetadataSeriesSettingsModal
                                show={showSettingsModal}
                                seriesId={linkId}
                                source={source}
                                sourceName={sourceName}
                                onClose={toggleSettingsModal}
                              />
                              <Button
                                className="text-panel-icon-action"
                                onClick={toggleSettingsModal}
                                tooltip="Open Settings"
                              >
                                <Icon path={mdiCogOutline} size={1} />
                              </Button>
                            </>
                          )
                          : null}
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

                  {linkedEntryQuery.isPending && (
                    <Icon path={mdiLoading} size={1} spin className="m-auto text-panel-text-primary" />
                  )}
                </div>
              )
              : <LinkSelectPanel seriesType={seriesQuery.data?.AniDB?.Type} source={source} sourceInfo={sourceInfo} />}

            <div
              className={cx(
                'relative w-full',
                showEpisodeMapping ? 'col-span-3' : 'col-span-2',
                showAnidbOnly && 'col-span-1!',
              )}
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualItem) => {
                const episode = episodes[virtualItem.index];
                const isOdd = virtualItem.index % 2 === 1;

                if (!episode && !episodesQuery.isFetchingNextPage) fetchNextPageDebounced();

                const overrides = episode
                  ? (linkOverrides[episode.IDs.AniDB] ?? finalEpisodeXrefs?.[episode.IDs.AniDB] ?? [''])
                  : [''];

                const existingXrefs = episode
                  ? episodeXrefs?.[episode.IDs.AniDB]?.map(xref => xref.ID ?? '')
                  : undefined;

                return (
                  <div
                    className={cx(
                      'absolute top-0 left-0 flex w-full gap-x-2',
                      episode && showEpisodeMapping && 'flex-col gap-y-2',
                    )}
                    style={{
                      transform: `translateY(${virtualItem.start ?? 0}px)`,
                    }}
                    key={episode?.IDs.ID ?? `loading-${virtualItem.key}`}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualItem.index}
                  >
                    {episode && showEpisodeMapping && (
                      map(
                        overrides,
                        (_, index) => (
                          <div
                            key={`episode-${episode.IDs.AniDB}-${index}`}
                            className="relative top-0 left-0 grid w-full grid-cols-[1fr_auto_1fr] gap-x-2"
                          >
                            <EpisodeRow
                              episode={episode}
                              offset={index}
                              isOdd={isOdd}
                              linkId={linkId}
                              linkedEpisodesPending={lastPageIds.length > 0 && linkedBulkEpisodesQuery.isPending}
                              setLinkOverrides={setLinkOverrides}
                              source={source}
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
                        linkId={linkId}
                        overrides={movieOverrides}
                        seriesId={seriesId}
                        setLinkOverrides={setMovieOverrides}
                        source={source}
                        xrefs={movieXrefs}
                      />
                    )}

                    {episode && showAnidbOnly && <AniDBEpisode episode={episode} isOdd={isOdd} />}

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
                        {showEpisodeMapping && (
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

// The source comes from the URL, so it is only used once it matches one the server lists.
const MetadataLinking = () => {
  const [searchParams] = useSearchParams();
  const sourcesQuery = useMetadataLinkSourcesQuery();

  if (sourcesQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} size={4} spin />
      </div>
    );
  }

  // Without a source, or with one the server does not list, the page lists the sources to pick one from.
  const requestedSource = searchParams.get('source') ?? '';
  const source = sourcesQuery.data?.find(item => isSameKey(item.Source, requestedSource))?.Source ?? '';

  return <MetadataLinkingContent source={source} />;
};

export default MetadataLinking;
