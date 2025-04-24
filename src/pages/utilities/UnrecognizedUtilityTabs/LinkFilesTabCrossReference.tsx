import React from 'react';

import { EpisodeTypeEnum } from '@/core/types/api/episode';

import type { AniDBEpisodeType } from '@/core/types/api/episode';
import type { ReleaseCrossReferenceType } from '@/core/types/api/file';
import type { AniDBSeriesType } from '@/core/types/api/series';

export type LinkFilesTab2CrossReferenceProps = {
  xref: ReleaseCrossReferenceType;
  episode: AniDBEpisodeType | null;
  anime: AniDBSeriesType | null;
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
          <span>
            {episode.Title}
          </span>
        </>
      )}
      {!episode && (
        <>
          <span className="text-panel-text-important">
            ??
          </span>
          &nbsp;-&nbsp;
          <span className="opacity-65">
            &lt;unknown&gt;
          </span>
        </>
      )}
      {(xref.PercentageStart !== 0 || xref.PercentageEnd !== 100) && (
        <>
          &nbsp;
          <span className="text-panel-text-important">
            {`(${xref.PercentageStart}-${xref.PercentageEnd}%)`}
          </span>
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
      {xref.AnidbAnimeID != null && xref.AnidbAnimeID > 0 && (
        <>
          &nbsp;|&nbsp;
          {anime
            ? (
              <>
                <span>
                  {anime.Title}
                </span>
                {anime.AirDate && !anime.Title.endsWith(` (${anime.AirDate.slice(0, 4)})`) && (
                  <>
                    &nbsp;
                    <span className="opacity-65">
                      (
                      {anime.AirDate.slice(0, 4)}
                      )
                    </span>
                  </>
                )}
              </>
            )
            : (
              <span className="opacity-65">
                &lt;unknown&gt;
              </span>
            )}
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
