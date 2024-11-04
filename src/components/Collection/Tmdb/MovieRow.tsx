import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mdiLinkOff, mdiLinkPlus, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, map, toNumber } from 'lodash';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import Button from '@/components/Input/Button';
import { useTmdbBulkMoviesOnlineQuery, useTmdbShowOrMovieQuery } from '@/core/react-query/tmdb/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { EpisodeType } from '@/core/types/api/episode';
import type { TmdbMovieXrefType } from '@/core/types/api/tmdb';
import type { Updater } from 'use-immer';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
  overrides: Record<number, number[]>;
  setLinkOverrides: Updater<Record<number, number[]>>;
  xrefs?: TmdbMovieXrefType[];
};

const MovieRow = React.memo((props: Props) => {
  const {
    episode,
    isOdd,
    overrides,
    setLinkOverrides,
    xrefs,
  } = props;

  const [searchParams] = useSearchParams();
  const tmdbId = toNumber(searchParams.get('id'));

  const xref = useMemo(
    () => xrefs?.find(ref => ref.AnidbEpisodeID === episode.IDs.AniDB),
    [episode.IDs.AniDB, xrefs],
  );

  const tmdbMovieQuery = useTmdbShowOrMovieQuery(tmdbId, 'Movie');
  const tmdbBulkMoviesQuery = useTmdbBulkMoviesOnlineQuery(
    { IDs: map(xrefs, item => item.TmdbMovieID) },
  );
  const tmdbMovie = useMemo(() => {
    if (!tmdbMovieQuery.data && !tmdbBulkMoviesQuery.data) return undefined;

    const override = overrides[episode.IDs.AniDB];
    if (override?.[0] === 0) return undefined;

    const tmdbMovies = [tmdbMovieQuery.data, ...(tmdbBulkMoviesQuery.data ?? [])];

    if (override?.[0]) {
      return find(tmdbMovies, { ID: override[0] });
    }

    if (!xref) return undefined;
    return find(tmdbMovies, { ID: xref.TmdbMovieID });
  }, [episode.IDs.AniDB, overrides, tmdbBulkMoviesQuery.data, tmdbMovieQuery.data, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;
      return tmdbBulkMoviesQuery.isPending || tmdbMovieQuery.isPending;
    },
    [tmdbBulkMoviesQuery.isPending, tmdbMovieQuery.isPending, xref, xrefs],
  );

  const handleOverrideLink = useEventCallback(() => {
    setLinkOverrides((draftState) => {
      const anidbEpisodeId = episode.IDs.AniDB;
      const newTmdbId = tmdbMovie?.ID ? 0 : tmdbId;
      // If already linked episode was unlinked and linked again, remove override
      if (draftState[anidbEpisodeId]?.[0] === 0 && newTmdbId === tmdbId) delete draftState[anidbEpisodeId];
      // If new link was created and removed, remove override
      else if (draftState[anidbEpisodeId]?.[0] === tmdbId && newTmdbId === 0) delete draftState[anidbEpisodeId];
      else draftState[anidbEpisodeId] = [newTmdbId];
    });
  });

  const lockMovie = useMemo(
    () => (tmdbMovie?.ID ? tmdbMovie?.ID !== tmdbId : false),
    [tmdbId, tmdbMovie],
  );

  return (
    <>
      <AniDBEpisode episode={episode} isOdd={isOdd} />

      <div
        className={cx(
          'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
        )}
      >
        {!isPending && (
          <div
            className="flex grow items-center justify-between"
            data-tooltip-id="tooltip"
            data-tooltip-content={lockMovie ? 'This episode is already linked to a different movie!' : ''}
          >
            <div className={cx('flex gap-x-6 items-center', lockMovie && 'opacity-65 pointer-events-none')}>
              Movie
              <div
                className="flex grow flex-col text-left"
                data-tooltip-id="tooltip"
                data-tooltip-content={tmdbMovie?.Title ?? ''}
              >
                <div className="line-clamp-1 text-xs font-semibold opacity-65">
                  {tmdbMovie?.Title ? tmdbMovie?.ReleasedAt ?? 'Airdate Unknown' : ''}
                </div>
                <div className="line-clamp-1">
                  {tmdbMovie?.Title ?? 'Entry Not Linked'}
                </div>
              </div>
            </div>
            {!lockMovie
              && (
                <Button
                  onClick={handleOverrideLink}
                >
                  <Icon
                    path={tmdbMovie ? mdiLinkOff : mdiLinkPlus}
                    size={1}
                    className={cx(tmdbMovie ? 'text-panel-text-danger' : 'text-panel-text-primary')}
                  />
                </Button>
              )}
          </div>
        )}

        {isPending
          && <Icon path={mdiLoading} spin size={1} className="m-auto text-panel-text-primary" />}
      </div>
    </>
  );
});

export default MovieRow;
