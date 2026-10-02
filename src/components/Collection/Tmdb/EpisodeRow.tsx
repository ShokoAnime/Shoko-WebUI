import { useMemo } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { find, map } from 'lodash';

import AniDBEpisode from '@/components/Collection/Tmdb/AniDBEpisode';
import EpisodeSelect from '@/components/Collection/Tmdb/EpisodeSelect';
import MatchRating from '@/components/Collection/Tmdb/MatchRating';
import { useMetadataBulkEpisodesQuery } from '@/core/react-query/metadata/queries';

import type { EpisodeType } from '@/core/types/api/episode';
import type { MetadataCrossReferenceType } from '@/core/types/api/metadata';
import type { Updater } from 'use-immer';

type Props = {
  episode: EpisodeType;
  isOdd: boolean;
  /** The source's ID of the series being linked. */
  linkId: string;
  linkedEpisodesPending: boolean;
  offset: number;
  setLinkOverrides: Updater<Record<number, string[]>>;
  source: string;
  existingXrefs?: string[];
  xrefs?: Record<string, MetadataCrossReferenceType[]>;
};

const EpisodeRow = (props: Props) => {
  const {
    episode,
    existingXrefs,
    isOdd,
    linkId,
    linkedEpisodesPending,
    offset,
    setLinkOverrides,
    source,
    xrefs,
  } = props;

  const xref = useMemo(
    () => {
      if (!xrefs?.[episode.IDs.AniDB]) return undefined;
      return xrefs[episode.IDs.AniDB][offset];
    },
    [episode.IDs.AniDB, offset, xrefs],
  );

  // This does not actually query the server. We already queried it in the parent component
  // This just gets the data from the cache
  const linkedEpisodesQuery = useMetadataBulkEpisodesQuery(source, []);
  const linkedEpisode = useMemo(() => {
    if (!xref?.ID) return undefined;
    return find(linkedEpisodesQuery.data, { ID: xref.ID });
  }, [linkedEpisodesQuery.data, xref]);

  const isPending = useMemo(
    () => {
      // Xrefs are not loaded yet
      if (!xrefs) return true;
      // Xrefs are loaded but episode doesn't have an xref
      if (!xref) return false;

      return !linkedEpisode && linkedEpisodesPending;
    },
    [linkedEpisode, linkedEpisodesPending, xref, xrefs],
  );

  const editExtraEpisodeLink = () => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.ID ?? '');
      }

      // If offset is 0, we are adding a link
      if (offset === 0) {
        draftState[episodeId].push('');
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

  const overrideLink = (newEpisodeId?: string) => {
    const episodeId = episode.IDs.AniDB;
    setLinkOverrides((draftState) => {
      if (!draftState[episodeId]) {
        draftState[episodeId] = map(xrefs?.[episodeId], item => item.ID ?? '');
      }

      if (newEpisodeId === undefined) {
        draftState[episodeId].splice(offset, 1);
        return;
      }

      if (newEpisodeId === '' && !existingXrefs && offset === 0) {
        delete draftState[episodeId];
        return;
      }

      draftState[episodeId][offset] = newEpisodeId;
    });
  };

  const matchRating = useMemo(() => {
    if (isPending) return undefined;
    return xref?.MatchRating;
  }, [isPending, xref]);

  const isDisabled = useMemo(() => {
    if (!linkedEpisode) return false;
    return linkedEpisode.SeriesID !== linkId;
  }, [linkedEpisode, linkId]);

  return (
    <>
      <AniDBEpisode
        episode={episode}
        isOdd={isOdd}
        extra={offset > 0}
        onIconClick={(offset > 0 || (linkedEpisode ?? xref?.ID)) ? editExtraEpisodeLink : undefined}
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
          linkId={linkId}
          linkedEpisode={linkedEpisode}
          override={xref?.ID ?? undefined}
          overrideLink={overrideLink}
          source={source}
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
