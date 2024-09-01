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
  overrides: Record<number, number>;
  setLinkOverrides: Updater<Record<number, number>>;
  tmdbEpisodesPending: boolean;
  xrefs?: TmdbEpisodeXrefType[];
};

const EpisodeRow = React.memo((props: Props) => {
  const {
    episode,
    isOdd,
    overrides,
    setLinkOverrides,
    tmdbEpisodesPending,
    xrefs,
  } = props;

  // TODO: Add support for 1-n (1 AniDB - n TMDB) mapping
  const xref = useMemo(
    () => xrefs?.find(ref => ref.AnidbEpisodeID === episode.IDs.AniDB),
    [episode.IDs.AniDB, xrefs],
  );

  // This does not actually query the server. We already queried it in the parent component
  // This just gets the data from the cache
  const tmdbEpisodesQuery = useTmdbBulkEpisodesQuery({ IDs: [] });
  const tmdbEpisode = useMemo(() => {
    if (!xref || !('TmdbEpisodeID' in xref)) return undefined;
    return find(tmdbEpisodesQuery.data, { ID: xref.TmdbEpisodeID });
  }, [tmdbEpisodesQuery.data, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;

      return !tmdbEpisode && tmdbEpisodesPending;
    },
    [tmdbEpisode, tmdbEpisodesPending, xref, xrefs],
  );

  const overrideLink = useEventCallback((newTmdbId?: number) => {
    const anidbEpisodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (newTmdbId === null || newTmdbId === undefined || newTmdbId === tmdbEpisode?.ID) {
        delete draftState[anidbEpisodeId];
      } else draftState[anidbEpisodeId] = newTmdbId;
    });
  });

  const matchRating = useMemo(() => {
    if (isPending) return undefined;
    if (overrides[episode.IDs.AniDB] === 0) return undefined;
    if (overrides[episode.IDs.AniDB]) return MatchRatingType.UserVerified;
    return xref?.Rating;
  }, [episode, isPending, overrides, xref]);

  return (
    <>
      <AniDBEpisode episode={episode} isOdd={isOdd} />

      <MatchRating rating={matchRating} />

      {!isPending && (
        <EpisodeSelect
          isOdd={isOdd}
          override={overrides[episode.IDs.AniDB]}
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
