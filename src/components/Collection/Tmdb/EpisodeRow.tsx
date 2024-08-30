import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mdiLinkOff, mdiLinkPlus, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, map, toNumber } from 'lodash';

import MatchRating from '@/components/Collection/Tmdb/MatchRating';
import Button from '@/components/Input/Button';
import {
  useTmdbBulkEpisodesQuery,
  useTmdbBulkMoviesQuery,
  useTmdbShowOrMovieQuery,
} from '@/core/react-query/tmdb/queries';
import { getEpisodePrefixAlt } from '@/core/utilities/getEpisodePrefix';
import useEventCallback from '@/hooks/useEventCallback';

import type { EpisodeType } from '@/core/types/api/episode';
import type { TmdbEpisodeType, TmdbEpisodeXRefType, TmdbMovieType, TmdbMovieXRefType } from '@/core/types/api/tmdb';

const Episode = React.memo(({ tmdbEpisode }: { tmdbEpisode?: TmdbEpisodeType }) => (
  <>
    {/* eslint-disable-next-line no-nested-ternary */}
    {tmdbEpisode ? (tmdbEpisode.SeasonNumber === 0 ? 'SP' : `S${tmdbEpisode.SeasonNumber}`) : 'XX'}
    <div>{tmdbEpisode?.EpisodeNumber.toString().padStart(2, '0') ?? 'XX'}</div>
    <div className="line-clamp-1">
      {tmdbEpisode?.Title ?? 'Entry Not Linked'}
    </div>
  </>
));

const Movie = React.memo((
  { handleOverrideLink, lock, tmdbMovie }: {
    lock: boolean;
    handleOverrideLink: () => void;
    tmdbMovie?: TmdbMovieType;
  },
) => (
  <div
    className="flex grow items-center justify-between"
    data-tooltip-id="tooltip"
    data-tooltip-content={lock ? 'This episode is already linked to a different movie!' : ''}
  >
    <div className={cx('flex gap-x-6', lock && 'opacity-65 pointer-events-none')}>
      Movie
      <div className="line-clamp-1">
        {tmdbMovie?.Title ?? 'Entry Not Linked'}
      </div>
    </div>
    {!lock
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
));

type Props = {
  episode: EpisodeType;
  overrideLink: (episodeId: number, newTmdbId: number) => void;
  overrides: Record<number, number>;
  xrefs?: TmdbEpisodeXRefType[] | TmdbMovieXRefType[];
  tmdbEpisodesPending: boolean;
  isOdd: boolean;
};

const EpisodeRow = React.memo((props: Props) => {
  const {
    episode,
    isOdd,
    overrideLink,
    overrides,
    tmdbEpisodesPending,
    xrefs,
  } = props;
  const [searchParams] = useSearchParams();
  const tmdbId = toNumber(searchParams.get('id'));
  const type = searchParams.get('type') as 'Show' | 'Movie' | null;

  // TODO: Add support for 1-n (1 AniDB - n TMDB) mapping
  const xref = useMemo(
    () => xrefs?.find(ref => ref.AnidbEpisodeID === episode.IDs.AniDB),
    [episode.IDs.AniDB, xrefs],
  );

  // This does not actually query the server. We already queried it in the parent component
  // This just gets the data from the cache
  const tmdbEpisodesQuery = useTmdbBulkEpisodesQuery({ IDs: [] }, type === 'Show');
  const tmdbEpisode = useMemo(() => {
    if (!xref || !('TmdbEpisodeID' in xref)) return undefined;
    return find(tmdbEpisodesQuery.data, { ID: xref.TmdbEpisodeID });
  }, [tmdbEpisodesQuery.data, xref]);

  const tmdbMovieQuery = useTmdbShowOrMovieQuery(tmdbId, 'Movie', type === 'Movie');
  const tmdbBulkMoviesQuery = useTmdbBulkMoviesQuery(
    { IDs: map(xrefs, item => (item as TmdbMovieXRefType).TmdbMovieID) },
    type === 'Movie' && xrefs && xrefs.length > 0,
  );
  const tmdbMovie = useMemo(() => {
    if (type !== 'Movie' || (!tmdbMovieQuery.data && !tmdbBulkMoviesQuery.data)) return undefined;

    const override = overrides[episode.IDs.AniDB];
    if (override === 0) return undefined;

    const tmdbMovies = [tmdbMovieQuery.data, ...(tmdbBulkMoviesQuery.data ?? [])];

    if (override) {
      return find(tmdbMovies, { ID: override });
    }

    if (!xref || !('TmdbMovieID' in xref)) return undefined;
    return find(tmdbMovies, { ID: xref.TmdbMovieID });
  }, [
    episode.IDs.AniDB,
    overrides,
    tmdbBulkMoviesQuery.data,
    tmdbMovieQuery.data,
    type,
    xref,
  ]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;
      if (type === 'Show') {
        return !tmdbEpisode && tmdbEpisodesPending;
      }
      return tmdbBulkMoviesQuery.isPending || tmdbMovieQuery.isPending;
    },
    [tmdbBulkMoviesQuery.isPending, tmdbEpisode, tmdbEpisodesPending, tmdbMovieQuery.isPending, type, xref, xrefs],
  );

  const handleOverrideLink = useEventCallback(() => {
    overrideLink(episode.IDs.AniDB, tmdbMovie?.ID ? 0 : tmdbId);
  });

  return (
    <>
      <div
        className={cx(
          'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
        )}
      >
        {getEpisodePrefixAlt(episode.AniDB?.Type)}
        <div>{episode.AniDB?.EpisodeNumber.toString().padStart(2, '0')}</div>
        <div className="line-clamp-1">{episode.Name}</div>
      </div>

      {type && (
        <>
          {type === 'Show' && (
            <MatchRating rating={isPending ? undefined : (xref as TmdbEpisodeXRefType | undefined)?.Rating} />
          )}

          <div
            className={cx(
              'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4',
              isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
            )}
          >
            {!isPending && (
              <>
                {type === 'Show' && <Episode tmdbEpisode={tmdbEpisode} />}
                {type === 'Movie' && (
                  <Movie
                    tmdbMovie={tmdbMovie}
                    lock={tmdbMovie?.ID ? tmdbId !== tmdbMovie.ID : false}
                    handleOverrideLink={handleOverrideLink}
                  />
                )}
              </>
            )}

            {isPending && <Icon path={mdiLoading} spin size={1} className="m-auto text-panel-text-primary" />}
          </div>
        </>
      )}
    </>
  );
});

export default EpisodeRow;
