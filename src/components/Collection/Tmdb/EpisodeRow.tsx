import React, { useMemo } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find } from 'lodash';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import EpisodeSelect from '@/components/Collection/Tmdb/EpisodeSelect';
import MatchRating from '@/components/Collection/Tmdb/MatchRating';
import { useTmdbBulkEpisodesQuery } from '@/core/react-query/tmdb/queries';
import { MatchRatingType } from '@/core/types/api/episode';
import useEventCallback from '@/hooks/useEventCallback';

import type { EpisodeType } from '@/core/types/api/episode';
import type { TmdbEpisodeXrefType } from '@/core/types/api/tmdb';
import type { Updater } from 'use-immer';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
  offset: number;
  overrides: Record<number, (number | undefined)[] | undefined>;
  setLinkOverrides: Updater<Record<number, (number | undefined)[] | undefined>>;
  tmdbEpisodesPending: boolean;
  xref?: TmdbEpisodeXrefType;
  xrefsPending: boolean;
};

const EpisodeRow = React.memo((props: Props) => {
  const {
    episode,
    isOdd,
    offset,
    overrides,
    setLinkOverrides,
    tmdbEpisodesPending,
    xref,
    xrefsPending,
  } = props;

  // This does not actually query the server. We already queried it in the parent component
  // This just gets the data from the cache
  const tmdbEpisodesQuery = useTmdbBulkEpisodesQuery({ IDs: [] });
  const tmdbEpisode = useMemo(() => {
    if (!xref || xref.TmdbEpisodeID === 0) return undefined;
    return find(tmdbEpisodesQuery.data, { ID: xref.TmdbEpisodeID });
  }, [tmdbEpisodesQuery.data, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (xrefsPending) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;

      return !tmdbEpisode && tmdbEpisodesPending;
    },
    [tmdbEpisode, tmdbEpisodesPending, xref, xrefsPending],
  );

  const addLink = useEventCallback(() => {
    const anidbEpisodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[anidbEpisodeId]) draftState[anidbEpisodeId] = [undefined];
      draftState[anidbEpisodeId]![draftState[anidbEpisodeId]!.length] = undefined;
    });
  });

  const removeLink = useEventCallback(() => {
    setLinkOverrides((draftState) => {
      if (!draftState[episode.IDs.AniDB]) draftState[episode.IDs.AniDB] = [undefined];
      draftState[episode.IDs.AniDB]!.splice(offset, 1);
    });
  });

  const overrideLink = useEventCallback((newTmdbId?: number) => {
    const anidbEpisodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[anidbEpisodeId]) draftState[anidbEpisodeId] = [undefined];
      if (
        newTmdbId === null || newTmdbId === undefined
        || (newTmdbId === tmdbEpisode?.ID && draftState[anidbEpisodeId]![offset] !== undefined)
      ) {
        draftState[anidbEpisodeId]![offset] = undefined;
      } else draftState[anidbEpisodeId]![offset] = newTmdbId;
    });
  });

  const matchRating = useMemo(() => {
    if (isPending) return undefined;
    if (overrides[episode.IDs.AniDB]?.[offset] === 0) return undefined;
    if (overrides[episode.IDs.AniDB]?.[offset]) return MatchRatingType.UserVerified;
    return xref?.Rating;
  }, [episode, isPending, overrides, xref, offset]);

  return (
    <>
      <AniDBEpisode
        episode={episode}
        isOdd={isOdd}
        extra={offset > 0}
        onIconClick={offset === 0 ? addLink : removeLink}
      />

      <MatchRating rating={matchRating} isOdd={isOdd} />

      {!isPending && (
        <EpisodeSelect
          isOdd={isOdd}
          override={overrides[episode.IDs.AniDB]?.[offset]}
          overrideLink={overrideLink}
          tmdbEpisode={tmdbEpisode}
        />
      )}

      {isPending
        && (
          <div
            className={cx(
              'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
              isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
            )}
          >
            <Icon path={mdiLoading} spin size={1} className="m-auto text-panel-text-primary" />
          </div>
        )}
    </>
  );
});

export default EpisodeRow;
