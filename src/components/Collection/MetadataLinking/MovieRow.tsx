import { useMemo } from 'react';
import { mdiLinkOff, mdiLinkPlus, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find } from 'lodash';

import AniDBEpisode from '@/components/Collection/MetadataLinking/AniDBEpisode';
import Button from '@/components/Input/Button';
import { useMetadataLookupQuery, useSeriesMetadataMoviesQuery } from '@/core/react-query/metadata/queries';

import type { EpisodeType } from '@/core/types/api/episode';
import type { MetadataCrossReferenceType } from '@/core/types/api/metadata';
import type { Updater } from 'use-immer';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
  /** The movie being linked. */
  linkId: string;
  /** The movie each AniDB episode is changed to link to, or an empty string to unlink it. */
  overrides: Record<number, string>;
  seriesId: number;
  setLinkOverrides: Updater<Record<number, string>>;
  source: string;
  xrefs?: MetadataCrossReferenceType[];
};

const MovieRow = (props: Props) => {
  const {
    episode,
    isOdd,
    linkId,
    overrides,
    seriesId,
    setLinkOverrides,
    source,
    xrefs,
  } = props;

  const xref = useMemo(
    () => xrefs?.find(ref => ref.AnidbEpisodeID === episode.IDs.AniDB),
    [episode.IDs.AniDB, xrefs],
  );

  const movieQuery = useMetadataLookupQuery(source, 'Movie', linkId);
  const linkedMoviesQuery = useSeriesMetadataMoviesQuery(seriesId, source, !!xrefs && xrefs.length > 0);
  const movie = useMemo(() => {
    const override = overrides[episode.IDs.AniDB];
    if (override === '') return undefined;

    const movies = [movieQuery.data, ...(linkedMoviesQuery.data ?? [])];

    if (override) {
      return find(movies, { ID: override });
    }

    if (!xref?.ID) return undefined;
    // A linked movie that is not stored yet is shown by its ID.
    return find(movies, { ID: xref.ID }) ?? { ID: xref.ID, Title: null, ReleaseDate: null };
  }, [episode.IDs.AniDB, linkedMoviesQuery.data, movieQuery.data, overrides, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;
      return linkedMoviesQuery.isPending || movieQuery.isPending;
    },
    [linkedMoviesQuery.isPending, movieQuery.isPending, xref, xrefs],
  );

  const handleOverrideLink = () => {
    setLinkOverrides((draftState) => {
      const anidbEpisodeId = episode.IDs.AniDB;
      const newId = movie?.ID ? '' : linkId;
      // If already linked episode was unlinked and linked again, remove override
      if (draftState[anidbEpisodeId] === '' && newId === linkId) delete draftState[anidbEpisodeId];
      // If new link was created and removed, remove override
      else if (draftState[anidbEpisodeId] === linkId && newId === '') delete draftState[anidbEpisodeId];
      else draftState[anidbEpisodeId] = newId;
    });
  };

  const lockMovie = useMemo(
    () => (movie?.ID ? movie?.ID !== linkId : false),
    [linkId, movie],
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
            <div className={cx('flex items-center gap-x-6', lockMovie && 'pointer-events-none opacity-65')}>
              Movie
              <div
                className="flex grow flex-col text-left"
                data-tooltip-id="tooltip"
                data-tooltip-content={movie?.Title ?? ''}
              >
                <div className="line-clamp-1 text-xs font-semibold opacity-65">
                  {movie ? movie.ReleaseDate ?? 'Airdate Unknown' : ''}
                </div>
                <div className="line-clamp-1">
                  {movie ? movie.Title ?? movie.ID : 'Entry Not Linked'}
                </div>
              </div>
            </div>
            {!lockMovie
              && (
                <Button
                  onClick={handleOverrideLink}
                  tooltip={movie ? 'Remove Link' : 'Add Link'}
                >
                  <Icon
                    path={movie ? mdiLinkOff : mdiLinkPlus}
                    size={1}
                    className={cx(movie ? 'text-panel-text-danger' : 'text-panel-text-primary')}
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
};

export default MovieRow;
