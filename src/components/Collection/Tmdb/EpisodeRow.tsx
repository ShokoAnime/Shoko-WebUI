import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, map, toNumber } from 'lodash';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import EpisodeSelect from '@/components/Collection/Tmdb/EpisodeSelect';
import MatchRating from '@/components/Collection/Tmdb/MatchRating';
import { useTmdbBulkEpisodesQuery } from '@/core/react-query/tmdb/queries';

import type { EpisodeType } from '@/core/types/api/episode';
import type { TmdbEpisodeXrefType } from '@/core/types/api/tmdb';
import type { Updater } from 'use-immer';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
  offset: number;
  setLinkOverrides: Updater<Record<number, number[]>>;
  tmdbEpisodesPending: boolean;
  existingXrefs?: number[];
  xrefs?: Record<string, TmdbEpisodeXrefType[]>;
};

const EpisodeRow = React.memo((props: Props) => {
  const {
    episode,
    existingXrefs,
    isOdd,
    offset,
    setLinkOverrides,
    tmdbEpisodesPending,
    xrefs,
  } = props;

  const [searchParams] = useSearchParams();
  const tmdbId = toNumber(searchParams.get('id'));

  const xref = useMemo(
    () => {
      if (!xrefs?.[episode.IDs.AniDB]) return undefined;
      return xrefs[episode.IDs.AniDB][offset];
    },
    [episode.IDs.AniDB, offset, xrefs],
  );

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
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;

      return !tmdbEpisode && tmdbEpisodesPending;
    },
    [tmdbEpisode, tmdbEpisodesPending, xref, xrefs],
  );

  const editExtraEpisodeLink = () => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.TmdbEpisodeID);
      }

      // If offset is 0, we are adding a link
      if (offset === 0) {
        draftState[episodeId].push(0);
        return;
      }

      draftState[episodeId].splice(offset, 1);

      // When existing xrefs are present and are more than 1,
      // we need to keep the first link to "overwrite" others
      if (existingXrefs && existingXrefs.length > 1) {
        return;
      }

      // When only one is preset, we can remove the override if existingXref was present
      if (draftState[episodeId].length === 1 && existingXrefs) {
        delete draftState[episodeId];
      }
    });
  };

  const overrideLink = (newTmdbId?: number) => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.TmdbEpisodeID);
      }

      if (newTmdbId === undefined) {
        draftState[episodeId].splice(offset, 1);
        return;
      }

      if (newTmdbId === 0 && !existingXrefs && offset === 0) {
        delete draftState[episodeId];
        return;
      }

      draftState[episodeId][offset] = newTmdbId;
    });
  };

  const matchRating = useMemo(() => {
    if (isPending) return undefined;
    return xref?.Rating;
  }, [isPending, xref]);

  const isDisabled = useMemo(() => {
    if (!tmdbEpisode) return false;
    return tmdbEpisode.ShowID !== tmdbId;
  }, [tmdbEpisode, tmdbId]);

  return (
    <>
      <AniDBEpisode
        episode={episode}
        isOdd={isOdd}
        extra={offset > 0}
        onIconClick={(offset > 0 || (tmdbEpisode ?? xref?.TmdbEpisodeID)) ? editExtraEpisodeLink : undefined}
      />

      <MatchRating
        rating={matchRating}
        isOdd={isOdd}
        isDisabled={isDisabled}
      />

      {!isPending && (
        <EpisodeSelect
          isDisabled={isDisabled}
          isOdd={isOdd}
          override={xref?.TmdbEpisodeID}
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
