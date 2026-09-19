import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, map, toNumber } from 'lodash';

import EpisodeSelect from '@/components/Collection/Anilist/EpisodeSelect';
import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import MatchRating from '@/components/Collection/Tmdb/MatchRating';

import type { AnilistEpisodeType, AnilistEpisodeXrefType } from '@/core/types/api/anilist';
import type { EpisodeType } from '@/core/types/api/episode';
import type { Updater } from 'use-immer';

type Props = {
  anilistEpisodes?: AnilistEpisodeType[];
  anilistEpisodesPending: boolean;
  episode: EpisodeType;
  existingXrefs?: number[];
  isOdd: boolean;
  offset: number;
  setLinkOverrides: Updater<Record<number, number[]>>;
  xrefs?: Record<string, AnilistEpisodeXrefType[]>;
};

const EpisodeRow = (props: Props) => {
  const {
    anilistEpisodes,
    anilistEpisodesPending,
    episode,
    existingXrefs,
    isOdd,
    offset,
    setLinkOverrides,
    xrefs,
  } = props;

  const [searchParams] = useSearchParams();
  const anilistId = toNumber(searchParams.get('id'));

  const xref = useMemo(
    () => {
      if (!xrefs?.[episode.IDs.AniDB]) return undefined;
      return xrefs[episode.IDs.AniDB][offset];
    },
    [episode.IDs.AniDB, offset, xrefs],
  );

  const anilistEpisode = useMemo(() => {
    if (!xref || xref.AnilistEpisodeID === 0) return undefined;
    return find(anilistEpisodes, { ID: xref.AnilistEpisodeID });
  }, [anilistEpisodes, xref]);

  const isDisabled = useMemo(() => {
    if (!xref || xref.AnilistEpisodeID === 0) return false;
    return xref.AnilistAnimeID !== anilistId;
  }, [anilistId, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;
      // Episodes for another anime are never loaded, so don't wait for them
      if (isDisabled) return false;

      return !anilistEpisode && anilistEpisodesPending;
    },
    [anilistEpisode, anilistEpisodesPending, isDisabled, xref, xrefs],
  );

  const editExtraEpisodeLink = () => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.AnilistEpisodeID);
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

  const overrideLink = (newAnilistId?: number) => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.AnilistEpisodeID);
      }

      if (newAnilistId === undefined) {
        draftState[episodeId].splice(offset, 1);
        return;
      }

      if (newAnilistId === 0 && !existingXrefs && offset === 0) {
        delete draftState[episodeId];
        return;
      }

      draftState[episodeId][offset] = newAnilistId;
    });
  };

  const matchRating = useMemo(() => {
    if (isPending) return undefined;
    return xref?.Rating;
  }, [isPending, xref]);

  return (
    <>
      <AniDBEpisode
        episode={episode}
        isOdd={isOdd}
        extra={offset > 0}
        onIconClick={(offset > 0 || (anilistEpisode ?? xref?.AnilistEpisodeID)) ? editExtraEpisodeLink : undefined}
      />

      <MatchRating
        rating={matchRating}
        isOdd={isOdd}
        isDisabled={isDisabled}
      />

      {!isPending && (
        <EpisodeSelect
          anilistEpisode={anilistEpisode}
          anilistEpisodes={anilistEpisodes}
          fallbackEpisodeNumber={xref?.AnilistEpisodeID ? xref.EpisodeNumber : undefined}
          isDisabled={isDisabled}
          isOdd={isOdd}
          override={xref?.AnilistEpisodeID}
          overrideLink={overrideLink}
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
};

export default EpisodeRow;
