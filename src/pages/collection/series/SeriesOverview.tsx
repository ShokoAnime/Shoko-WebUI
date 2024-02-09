import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { get, round, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import CharacterImage from '@/components/CharacterImage';
import SeriesEpisode from '@/components/Collection/Series/SeriesEpisode';
import SeriesMetadata from '@/components/Collection/SeriesMetadata';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useRelatedAnimeQuery,
  useSeriesCastQuery,
  useSeriesNextUpQuery,
  useSeriesQuery,
  useSimilarAnimeQuery,
} from '@/core/react-query/series/queries';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast, SeriesType } from '@/core/types/api/series';

// Links
const MetadataLinks = ['AniDB', 'TMDB', 'TvDB', 'TraktTv'];

const SeriesOverview = () => {
  const { seriesId } = useParams();

  const seriesQuery = useSeriesQuery(toNumber(seriesId!), { includeDataFrom: ['AniDB'] }, !!seriesId);
  const series = useMemo(() => seriesQuery?.data ?? {} as SeriesType, [seriesQuery.data]);
  const nextUpEpisodeQuery = useSeriesNextUpQuery(toNumber(seriesId!), {
    includeDataFrom: ['AniDB', 'TvDB'],
    includeMissing: false,
    onlyUnwatched: false,
  }, !!seriesId);
  const relatedAnimeQuery = useRelatedAnimeQuery(toNumber(seriesId!), !!seriesId);
  const similarAnimeQuery = useSimilarAnimeQuery(toNumber(seriesId!), !!seriesId);

  const related = useMemo(() => relatedAnimeQuery?.data ?? [], [relatedAnimeQuery.data]);
  const similar = useMemo(() => similarAnimeQuery?.data ?? [], [similarAnimeQuery.data]);
  const cast = useSeriesCastQuery(toNumber(seriesId!), !!seriesId).data;

  const getThumbnailUrl = (item: SeriesCast, mode: string) => {
    const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
    if (thumbnail === null) return null;
    return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
  };

  return (
    <>
      <div className="flex gap-x-6">
        <div className="flex w-full grow flex-col gap-y-6">
          <ShokoPanel
            title="Episode on Deck"
            className="flex w-full grow overflow-visible"
            transparent
            isFetching={nextUpEpisodeQuery.isFetching}
          >
            {nextUpEpisodeQuery.isSuccess && nextUpEpisodeQuery.data
              ? <SeriesEpisode episode={nextUpEpisodeQuery.data} nextUp />
              : <div className="flex grow items-center justify-center font-semibold">No Episode Data Available!</div>}
          </ShokoPanel>
          <ShokoPanel
            title="Metadata Sites"
            className="flex w-full flex-wrap"
            transparent
            disableOverflow
          >
            <div className="flex flex-wrap gap-2 lg:gap-x-4 2xl:flex-nowrap 2xl:gap-x-6">
              {MetadataLinks.map((site) => {
                const idOrIds = series.IDs[site] as number | number[];
                if (typeof idOrIds === 'number' || idOrIds.length === 0) {
                  const id = typeof idOrIds === 'number' ? idOrIds : idOrIds[0] || 0;
                  return (
                    <div
                      className="w-full max-w-[18.75rem] rounded border border-panel-border bg-panel-background px-4 py-3"
                      key={`${site}-${id}`}
                    >
                      <SeriesMetadata site={site} id={idOrIds} seriesId={series.IDs.ID} />
                    </div>
                  );
                }
                return idOrIds.map(id => (
                  <div
                    className="w-full max-w-[18.75rem] rounded border border-panel-border bg-panel-background px-4 py-3"
                    key={`${site}-${id}`}
                  >
                    <SeriesMetadata site={site} id={id} seriesId={series.IDs.ID} />
                  </div>
                ));
              })}
            </div>
          </ShokoPanel>
        </div>
      </div>

      {related.length > 0 && (
        <ShokoPanel title="Related Anime" className="w-full" transparent>
          <div className={cx('flex gap-x-5', related.length > 5 && ('mb-4'))}>
            {related.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              const itemRelation = item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2');
              const isDisabled = item.ShokoID === null;
              if (isDisabled) {
                return (
                  <div
                    key={`image-${thumbnail?.ID}`}
                    className="flex w-[13.875rem] shrink-0 flex-col gap-y-3 text-center font-semibold"
                  >
                    <BackgroundImagePlaceholderDiv
                      image={thumbnail}
                      className="h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
                    />
                    <div>
                      <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                      <span className="text-sm text-panel-text-important">{itemRelation}</span>
                    </div>
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
                    className="group h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
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
          <div className={cx('shoko-scrollbar flex gap-x-5', similar.length > 5 && ('mb-4'))}>
            {similar.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              const isDisabled = item.ShokoID === null;
              if (isDisabled) {
                return (
                  <div
                    key={`image-${thumbnail?.ID}`}
                    className="flex w-[13.875rem] shrink-0 flex-col gap-y-3 text-center font-semibold"
                  >
                    <BackgroundImagePlaceholderDiv
                      image={thumbnail}
                      className="h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
                    />
                    <div>
                      <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                      <span className="text-sm text-panel-text-important">
                        {round(item.UserApproval.Value, 2)}
                        % (
                        {item.UserApproval.Votes}
                        &nbsp;votes)
                      </span>
                    </div>
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
                    className="group h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
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
      <ShokoPanel title="Top 20 Seiyuu" className="w-full" transparent>
        <div className="z-10 flex w-full gap-x-6">
          {cast?.slice(0, 20).map(seiyuu => (
            seiyuu.RoleName === 'Seiyuu' && (
              <div
                key={`${seiyuu.Character.Name}-${seiyuu.Staff.Name}`}
                className="flex flex-col items-center gap-y-3 pb-3"
              >
                <div className="flex gap-x-4">
                  <CharacterImage
                    imageSrc={getThumbnailUrl(seiyuu, 'Character')}
                    className="relative h-[12rem] w-[9rem] rounded-lg"
                  />
                  <CharacterImage
                    imageSrc={getThumbnailUrl(seiyuu, 'Staff')}
                    className="relative h-[12rem] w-[9rem] rounded-lg"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="line-clamp-1 text-ellipsis text-xl font-semibold">{seiyuu.Character.Name}</span>
                  <span className="line-clamp-1 text-ellipsis text-sm font-semibold opacity-65">
                    {seiyuu.Staff.Name}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </ShokoPanel>
    </>
  );
};

export default SeriesOverview;
