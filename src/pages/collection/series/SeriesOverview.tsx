import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { get, round, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import EpisodeDetails from '@/components/Collection/Series/EpisodeDetails';
import SeriesMetadata from '@/components/Collection/SeriesMetadata';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useGetSeriesQuery,
  useNextUpEpisodeQuery,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import useEpisodeThumbnail from '@/hooks/useEpisodeThumbnail';

import type { EpisodeType } from '@/core/types/api/episode';
import type { SeriesAniDBRelatedType, SeriesAniDBSimilarType } from '@/core/types/api/series';

const NextUpEpisode = ({ nextUpEpisode }: { nextUpEpisode: EpisodeType }) => {
  const thumbnail = useEpisodeThumbnail(nextUpEpisode);
  return (
    <div className="z-10 flex items-center gap-x-8">
      <BackgroundImagePlaceholderDiv
        image={thumbnail}
        className="h-[13rem] min-w-[22.3125rem] rounded-md border border-panel-border"
      />
      <EpisodeDetails episode={nextUpEpisode} />
    </div>
  );
};

const SeriesOverview = () => {
  const { seriesId } = useParams();

  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series = useMemo(() => seriesData?.data, [seriesData]);
  const nextUpEpisodeData = useNextUpEpisodeQuery({ seriesId: toNumber(seriesId) });
  const nextUpEpisode: EpisodeType = nextUpEpisodeData?.data ?? {} as EpisodeType;
  const relatedData = useGetAniDBRelatedQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const related: SeriesAniDBRelatedType[] = relatedData?.data ?? [] as SeriesAniDBRelatedType[];
  const similarData = useGetAniDBSimilarQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const similar: SeriesAniDBSimilarType[] = similarData?.data ?? [] as SeriesAniDBSimilarType[];

  // Links
  const metadataLinks = ['AniDB', 'TMDB', 'TvDB', 'TraktTv'];

  if (!seriesId || !series) return null;

  return (
    <>
      <div className="flex gap-x-8">
        <div className="flex w-full grow flex-row gap-x-8">
          <ShokoPanel
            title="Episode on Deck"
            className="flex w-full max-w-[71.875rem] grow overflow-visible"
            transparent
          >
            {get(nextUpEpisode, 'Name', false)
              ? <NextUpEpisode nextUpEpisode={nextUpEpisode} />
              : <div className="flex grow items-center justify-center font-semibold">No Episode Data Available!</div>}
          </ShokoPanel>
          <ShokoPanel
            title="Metadata Sites"
            className="flex w-full max-w-[42.188rem] grow-0"
            transparent
          >
            <div className="flex flex-col gap-y-2">
              {metadataLinks.map(site => (
                <div className="rounded border border-panel-border bg-panel-background-alt px-4 py-3" key={site}>
                  <SeriesMetadata site={site} id={series.IDs[site]} />
                </div>
              ))}
            </div>
          </ShokoPanel>
        </div>
      </div>

      {related.length > 0 && (
        <ShokoPanel title="Related Anime" className="w-full" transparent>
          <div className={cx('flex gap-x-5', related.length > 7 && ('mb-4'))}>
            {related.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              const itemRelation = item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2');
              const isDisabled = item.ShokoID === null;
              if (isDisabled) {
                return (
                  <div
                    key={`image-${thumbnail?.ID}`}
                    className="flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold"
                  >
                    <BackgroundImagePlaceholderDiv
                      image={thumbnail}
                      className="h-[19.875rem] w-[13.875rem] rounded-md border border-panel-border drop-shadow-md"
                    />
                    <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                    <span className="text-sm text-panel-text-important">{itemRelation}</span>
                  </div>
                );
              }
              return (
                <Link
                  key={`image-${thumbnail?.ID}-link`}
                  to={`/webui/collection/series/${item.ShokoID}`}
                  className="flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold"
                >
                  <BackgroundImagePlaceholderDiv
                    image={thumbnail}
                    className="group h-[19.875rem] w-[13.875rem] rounded-md border border-panel-border drop-shadow-md"
                    hidePlaceholderOnHover
                    zoomOnHover
                  >
                    <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                      In Collection
                    </div>
                    <div className="pointer-events-none z-50 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
                  </BackgroundImagePlaceholderDiv>
                  <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                  <span className="text-sm text-panel-text-important">{itemRelation}</span>
                </Link>
              );
            })}
          </div>
        </ShokoPanel>
      )}

      {similar.length > 0 && (
        <ShokoPanel title="Similar Anime" className="w-full" transparent>
          <div className={cx('shoko-scrollbar flex gap-x-5', similar.length > 7 && ('mb-4'))}>
            {similar.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              const isDisabled = item.ShokoID === null;
              if (isDisabled) {
                return (
                  <div
                    key={`image-${thumbnail?.ID}`}
                    className="flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold"
                  >
                    <BackgroundImagePlaceholderDiv
                      image={thumbnail}
                      className="h-[19.875rem] w-[13.875rem] rounded-md border border-panel-border drop-shadow-md"
                    />
                    <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                    <span className="text-sm text-panel-text-important">
                      {round(item.UserApproval.Value, 2)}
                      % (
                      {item.UserApproval.Votes}
                      &nbsp;votes)
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={`image-${thumbnail?.ID}-link`}
                  to={`/webui/collection/series/${item.ShokoID}`}
                  className="flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold"
                >
                  <BackgroundImagePlaceholderDiv
                    image={thumbnail}
                    className="group h-[19.875rem] w-[13.875rem] rounded-md border border-panel-border drop-shadow-md"
                  >
                    <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                      In Collection
                    </div>
                    <div className="pointer-events-none z-50 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100" />
                  </BackgroundImagePlaceholderDiv>
                  <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                  <span className="text-sm text-panel-text-important">
                    {round(item.UserApproval.Value, 2)}
                    % (
                    {item.UserApproval.Votes}
                    &nbsp;votes)
                  </span>
                </Link>
              );
            })}
          </div>
        </ShokoPanel>
      )}
    </>
  );
};

export default SeriesOverview;
