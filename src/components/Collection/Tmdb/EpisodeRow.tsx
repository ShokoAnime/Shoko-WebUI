import React, { useMemo } from 'react';
import cx from 'classnames';
import { find } from 'lodash';

import MatchRating from '@/components/Collection/Tmdb/MatchRating';
import { getEpisodePrefixAlt } from '@/core/utilities/getEpisodePrefix';

import type { EpisodeType } from '@/core/types/api/episode';
import type { TmdbEpisodeXRefType, TmdbMovieXRefType } from '@/core/types/api/tmdb';

const Episode = React.memo(({ episode, xref }: { episode: EpisodeType, xref?: TmdbEpisodeXRefType }) => {
  const tmdbEpisode = useMemo(() => {
    if (!xref || !episode.TMDB) return undefined;
    return find(episode.TMDB.Episodes, { ID: xref.TmdbEpisodeID });
  }, [episode, xref]);

  return (
    <>
      {/* eslint-disable-next-line no-nested-ternary */}
      {tmdbEpisode ? (tmdbEpisode.SeasonNumber === 0 ? 'SP' : `S${tmdbEpisode.SeasonNumber}`) : 'XX'}
      <div>{tmdbEpisode?.EpisodeNumber.toString().padStart(2, '0') ?? 'XX'}</div>
      {tmdbEpisode?.Title ?? 'Entry Not Linked'}
    </>
  );
});

const Movie = React.memo(({ episode, xref }: { episode: EpisodeType, xref?: TmdbMovieXRefType }) => {
  const tmdbMovie = useMemo(() => {
    if (!xref || !episode.TMDB) return undefined;
    return find(episode.TMDB.Movies, { ID: xref.TmdbMovieID });
  }, [episode, xref]);

  return (
    <>
      Movie
      <div>
        {tmdbMovie?.Title ?? 'Entry Not Linked'}
      </div>
    </>
  );
});

type Props = {
  episode: EpisodeType;
  type: 'tv' | 'movie' | null;
  xrefs: TmdbEpisodeXRefType[] | TmdbMovieXRefType[];
  isOdd: boolean;
};

const EpisodeRow = ({ episode, isOdd, type, xrefs }: Props) => {
  // TODO: Add support for 1-n (1 AniDB - n TMDB) mapping
  const xref = useMemo(
    () => xrefs.find(ref => ref.AnidbEpisodeID === episode.IDs.AniDB),
    [episode.IDs.AniDB, xrefs],
  );

  return (
    <>
      <div
        className={cx(
          'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4 leading-5',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
        )}
      >
        {getEpisodePrefixAlt(episode.AniDB?.Type)}
        <div>{episode.AniDB?.EpisodeNumber.toString().padStart(2, '0')}</div>
        {episode.Name}
      </div>

      {type === 'tv' && <MatchRating rating={(xref as TmdbEpisodeXRefType | undefined)?.Rating} />}

      <div
        className={cx(
          'flex grow basis-0 gap-x-6 rounded-lg border border-panel-border p-4 leading-5',
          isOdd ? 'bg-panel-background-alt' : 'bg-panel-background',
        )}
      >
        {type === 'tv' && <Episode episode={episode} xref={xref as TmdbEpisodeXRefType | undefined} />}
        {type === 'movie' && <Movie episode={episode} xref={xref as TmdbMovieXRefType | undefined} />}
      </div>
    </>
  );
};

export default EpisodeRow;
