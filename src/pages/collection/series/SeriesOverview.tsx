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

  const relatedAnime = useMemo(() => relatedAnimeQuery?.data ?? [], [relatedAnimeQuery.data]);
  const similarAnime = useMemo(() => similarAnimeQuery?.data ?? [], [similarAnimeQuery.data]);
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
              ? <SeriesEpisode episode={nextUpEpisodeQuery.data} seriesId={toNumber(seriesId)} nextUp />
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

      {relatedAnime.length > 0 && (
        <ShokoPanel title="Related Anime" className="w-full" transparent>
          <div className={cx('flex gap-x-5', relatedAnime.length > 5 && ('mb-4'))}>
            {relatedAnime.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              const itemRelation = item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2');
              return (
                <Link
                  key={item.ID}
                  to={`/webui/collection/series/${item.ShokoID}`}
                  className={cx(
                    'flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold',
                    !item.ShokoID && 'pointer-events-none',
                  )}
                >
                  <BackgroundImagePlaceholderDiv
                    image={thumbnail}
                    className="group h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
                    hidePlaceholderOnHover
                    overlayOnHover
                    zoomOnHover
                  >
                    {item.ShokoID && (
                      <div className="absolute bottom-4 left-3 flex w-[90%] justify-center rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                        In Collection
                      </div>
                    )}
                  </BackgroundImagePlaceholderDiv>
                  <span className="line-clamp-1 text-ellipsis text-sm">{item.Title}</span>
                  <span className="text-sm text-panel-text-important">{itemRelation}</span>
                </Link>
              );
            })}
          </div>
        </ShokoPanel>
      )}

      {similarAnime.length > 0 && (
        <ShokoPanel title="Similar Anime" className="w-full" transparent>
          <div className={cx('shoko-scrollbar flex gap-x-5', similarAnime.length > 5 && ('mb-4'))}>
            {similarAnime.map((item) => {
              const thumbnail = get(item, 'Poster', null);
              return (
                <Link
                  key={item.ID}
                  to={`/webui/collection/series/${item.ShokoID}`}
                  className={cx(
                    'flex w-[13.875rem] shrink-0 flex-col gap-y-2 text-center font-semibold',
                    !item.ShokoID && 'pointer-events-none',
                  )}
                >
                  <BackgroundImagePlaceholderDiv
                    image={thumbnail}
                    className="group h-[19.875rem] w-[13.875rem] rounded-lg border border-panel-border drop-shadow-md"
                    hidePlaceholderOnHover
                    overlayOnHover
                    zoomOnHover
                  >
                    {item.ShokoID && (
                      <div className="absolute bottom-4 left-3 flex w-[90%] justify-center rounded-lg bg-panel-background-overlay py-2 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
                        In Collection
                      </div>
                    )}
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
                    className="relative h-48 w-36 rounded-lg"
                  />
                  <CharacterImage
                    imageSrc={getThumbnailUrl(seiyuu, 'Staff')}
                    className="relative h-48 w-36 rounded-lg"
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
