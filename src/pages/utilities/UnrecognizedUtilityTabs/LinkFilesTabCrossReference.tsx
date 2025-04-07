import React from 'react';

import type { AniDBEpisodeType } from '@/core/types/api/episode';
import type { ReleaseCrossReferenceType } from '@/core/types/api/file';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';

export type LinkFilesTab2CrossReferenceProps = {
  xref: ReleaseCrossReferenceType;
  episode: AniDBEpisodeType | null;
  anime: SeriesAniDBSearchResult | null;
};

function noPropagate(event: React.MouseEvent): void {
  event.stopPropagation();
}

function LinkFilesTabCrossReference(props: LinkFilesTab2CrossReferenceProps): React.JSX.Element {
  const { anime, episode, xref } = props;
  return (
    <div>
      <span className="text-sm font-semibold">
        {xref.AnidbAnimeID != null && xref.AnidbAnimeID > 0 && (
          <>
            {anime?.Title ?? 'Unknown'}
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
            &nbsp;|&nbsp;
          </>
        )}
        {episode?.Title}
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
      </span>
    </div>
  );
}

export default LinkFilesTabCrossReference;
