import React from 'react';

import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { AniDBEpisodeType } from '@/core/types/api/episode';
import type { ReleaseCrossReferenceType } from '@/core/types/api/file';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

export type LinkFilesTab2CrossReferenceProps = {
  xref: ReleaseCrossReferenceType;
  episode: AniDBEpisodeType | null;
  anime: SeriesAniDBSearchResult | null;
};

function episodeNumber(episode: AniDBEpisodeType): string {
  switch (episode.Type) {
    case EpisodeTypeEnum.Normal:
      return `${episode.EpisodeNumber.toString().padStart(2, '0')}`;
    case EpisodeTypeEnum.Special:
      return `S${episode.EpisodeNumber}`;
    case EpisodeTypeEnum.ThemeSong:
      return `C${episode.EpisodeNumber}`;
    case EpisodeTypeEnum.Trailer:
      return `T${episode.EpisodeNumber}`;
    case EpisodeTypeEnum.Parody:
      return `P${episode.EpisodeNumber}`;
    case EpisodeTypeEnum.Other:
      return `O ${episode.EpisodeNumber}`;
    default:
      return '??';
  }
}

function noPropagate(event: React.MouseEvent): void {
  event.stopPropagation();
}

function LinkFilesTabCrossReference(props: LinkFilesTab2CrossReferenceProps): React.JSX.Element {
  const { anime, episode, xref } = props;
  return (
    <span className="text-sm font-semibold">
      {episode && (
        <>
          <span className="text-panel-text-important">
            {episodeNumber(episode)}
          </span>
          &nbsp;-&nbsp;
          {episode.Title}
        </>
      )}
      {!episode && (
        <>
          <span className="text-panel-text-important">
            ??
          </span>
          &nbsp;-&nbsp;
          {'<unknown>'}
        </>
      )}
      &nbsp;
      <a
        className="text-panel-text-primary"
        href={`https://anidb.net/episode/${xref.AnidbEpisodeID}`}
        onClick={noPropagate}
        target="_blank"
        rel="noreferrer noopener"
      >
        (e
        {xref.AnidbEpisodeID}
        )
      </a>
      {xref.PercentageStart !== 0 || xref.PercentageEnd !== 100
        ? ` (${xref.PercentageStart}-${xref.PercentageEnd}%)`
        : ''}
      {xref.AnidbAnimeID != null && xref.AnidbAnimeID > 0 && (
        <>
          &nbsp;|&nbsp;
          {anime?.Title ?? '<unknown>'}
          &nbsp;
          <a
            className="text-panel-text-primary"
            href={`https://anidb.net/anime/${xref.AnidbAnimeID}`}
            onClick={noPropagate}
            target="_blank"
            rel="noreferrer noopener"
          >
            (a
            {xref.AnidbAnimeID}
            )
          </a>
        </>
      )}
    </span>
  );
}

export default LinkFilesTabCrossReference;
