import React from 'react';

import { useEpisodeAniDBQuery } from '@/core/react-query/episode/queries';
import { useSeriesAniDBQuery } from '@/core/react-query/series/queries';
import { EpisodeTypeEnum } from '@/core/types/api/episode';
import { getEpisodePrefix } from '@/core/utilities/getEpisodePrefix';

import type { ReleaseCrossReferenceType } from '@/core/types/api/file';

function noPropagate(event: React.MouseEvent): void {
  event.stopPropagation();
}

const UnrecognizedVideoCrossReference = ({ xref }: { xref: ReleaseCrossReferenceType }) => {
  const { AnidbAnimeID, AnidbEpisodeID } = xref;

  const animeQuery = useSeriesAniDBQuery(AnidbAnimeID!, !!AnidbAnimeID);
  const episodeQuery = useEpisodeAniDBQuery(AnidbEpisodeID);

  return (
    <span className="text-sm font-semibold">
      {episodeQuery.isSuccess && (
        <>
          <span className="text-panel-text-important">
            {getEpisodePrefix(episodeQuery.data.Type)}
            {episodeQuery.data.Type === EpisodeTypeEnum.Episode
              ? episodeQuery.data.EpisodeNumber.toString().padStart(2, '0')
              : episodeQuery.data.EpisodeNumber}
          </span>
          &nbsp;-&nbsp;
          <span>
            {episodeQuery.data.Title}
          </span>
        </>
      )}
      {!episodeQuery.isSuccess && (
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
      {xref.AnidbAnimeID && (
        <>
          &nbsp;|&nbsp;
          {animeQuery.isSuccess
            ? (
              <>
                <span>
                  {animeQuery.data.Title}
                </span>
                {animeQuery.data.AirDate && !animeQuery.data.Title.endsWith(` (${animeQuery.data.AirDate.slice(0, 4)})`)
                  && (
                    <>
                      &nbsp;
                      <span className="opacity-65">
                        (
                        {animeQuery.data.AirDate.slice(0, 4)}
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
};

export default UnrecognizedVideoCrossReference;
