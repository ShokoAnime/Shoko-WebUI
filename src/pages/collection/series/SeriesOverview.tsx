import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { mdiEarth, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { flatMap, get, round, toNumber } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import CharacterImage from '@/components/CharacterImage';
import EpisodeSummary from '@/components/Collection/Episode/EpisodeSummary';
import SeriesMetadata from '@/components/Collection/SeriesMetadata';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import {
  useRelatedAnimeQuery,
  useSeriesCastQuery,
  useSeriesNextUpQuery,
  useSeriesQuery,
  useSimilarAnimeQuery,
} from '@/core/react-query/series/queries';
import useEventCallback from '@/hooks/useEventCallback';

import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast, SeriesType } from '@/core/types/api/series';

// Links
const MetadataLinks = ['AniDB', 'TMDB', 'TraktTv', 'TvDB'] as const;

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

  const tabStates = [
    { label: 'Metadata Sites', value: 'metadata' },
    { label: 'Series Links', value: 'links' },
  ];
  const [currentTab, setCurrentTab] = useState<string>(tabStates[0].value);

  const handleTabStateChange = useEventCallback((newState: string) => {
    setCurrentTab(newState);
  });

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
        <div className="flex w-full gap-x-6">
          <ShokoPanel
            title="Metadata Sites"
            className="flex w-full max-w-[37.5rem]"
            transparent
            disableOverflow
            options={
              <MultiStateButton states={tabStates} activeState={currentTab} onStateChange={handleTabStateChange} />
            }
          >
            {currentTab === 'metadata'
              ? (
                <div
                  className={cx(
                    'flex h-[15.625rem] flex-col gap-3 overflow-y-auto lg:gap-x-4 2xl:flex-nowrap 2xl:gap-x-6',
                    // TODO: The below needs to check for how many links are rendered, not how many types of links can exist
                    MetadataLinks.length > 4 ? 'pr-4' : '',
                  )}
                >
                  {MetadataLinks.map((site) => {
                    const idOrIds = series.IDs[site];

                    if (site === 'TMDB') {
                      const tmdbIds = idOrIds as { Movie: number[], Show: number[] };

                      if (tmdbIds.Movie.length + tmdbIds.Show.length === 0) {
                        return <SeriesMetadata key={site} site={site} seriesId={series.IDs.ID} />;
                      }

                      return flatMap(tmdbIds, (ids, type: 'Movie' | 'Show') =>
                        ids.map(id => (
                          <SeriesMetadata
                            key={`${site}-${type}-${id}`}
                            site={site}
                            id={id}
                            seriesId={series.IDs.ID}
                            type={type}
                          />
                        )));
                    }

                    // Site is not TMDB, so it's either a single ID or an array of IDs
                    let linkIds = (typeof idOrIds === 'number' ? [idOrIds] : idOrIds) as number[];
                    if (linkIds.length === 0) linkIds = [0];

                    return linkIds.map(id => (
                      <SeriesMetadata key={`${site}-${id}`} site={site} id={id} seriesId={series.IDs.ID} />
                    ));
                  })}

                  {/* Show row to add TMDB link if a link already exists */}
                  {(series.IDs.TMDB.Show.length !== 0
                    || series.IDs.TMDB.Movie.length !== 0) && <SeriesMetadata site="TMDB" seriesId={series.IDs.ID} />}
                </div>
              )
              : (
                <div
                  className={cx(
                    'flex h-[15.625rem] flex-col gap-3 overflow-y-auto',
                    series.Links.length > 4 ? 'pr-4' : '',
                  )}
                >
                  {series.Links.map(link => (
                    <a
                      className="flex w-full gap-x-2 rounded-lg border border-panel-border bg-panel-background px-4 py-3 text-left !text-base !font-normal text-panel-icon-action hover:bg-panel-toggle-background-hover"
                      key={link.URL}
                      href={link.URL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon
                        className="text-panel-icon"
                        path={mdiEarth}
                        size={1}
                      />

                      {link.Name}
                      <Icon
                        className="text-panel-icon-action"
                        path={mdiOpenInNew}
                        size={1}
                      />
                    </a>
                  ))}
                </div>
              )}
          </ShokoPanel>
          <ShokoPanel
            title="Episode On Deck"
            className="flex w-full grow overflow-visible"
            transparent
            isFetching={nextUpEpisodeQuery.isFetching}
          >
            {nextUpEpisodeQuery.isSuccess && nextUpEpisodeQuery.data
              ? <EpisodeSummary seriesId={toNumber(seriesId)} episode={nextUpEpisodeQuery.data} nextUp />
              : (
                <div className="flex grow items-center justify-center font-semibold">
                  All available episodes have already been watched
                </div>
              )}
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
          {cast?.filter(credit => credit.RoleName === 'Seiyuu').slice(0, 20).map(seiyuu => (
            <div
              key={`${seiyuu.Character.Name}-${Math.random() * (cast.length + seiyuu.Character.Name.length)}`}
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
          ))}
        </div>
      </ShokoPanel>
    </>
  );
};

export default SeriesOverview;
