import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import { mdiEarth, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { flatMap, get, map, round } from 'lodash';

import CharacterImage from '@/components/CharacterImage';
import EpisodeSummary from '@/components/Collection/Episode/EpisodeSummary';
import SeriesMetadata from '@/components/Collection/SeriesMetadata';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import SeriesPoster from '@/components/SeriesPoster';
import {
  useRelatedAnimeQuery,
  useSeriesCastQuery,
  useSeriesNextUpQuery,
  useSimilarAnimeQuery,
} from '@/core/react-query/series/queries';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast } from '@/core/types/api/series';

// Links
const MetadataLinks = ['AniDB', 'TMDB', 'TraktTv'] as const;

const SeriesOverview = () => {
  const { series } = useOutletContext<SeriesContextType>();

  const nextUpEpisodeQuery = useSeriesNextUpQuery(series.IDs.ID, {
    includeDataFrom: ['AniDB'],
    includeMissing: false,
    onlyUnwatched: false,
  });
  const relatedAnimeQuery = useRelatedAnimeQuery(series.IDs.ID);
  const similarAnimeQuery = useSimilarAnimeQuery(series.IDs.ID);

  const tabStates = [
    { label: 'Metadata Sites', value: 'metadata' },
    { label: 'Series Links', value: 'links' },
  ];
  const [currentTab, setCurrentTab] = useState<string>(tabStates[0].value);

  const handleTabStateChange = (newState: string) => {
    setCurrentTab(newState);
  };

  const relatedAnime = useMemo(() => relatedAnimeQuery?.data ?? [], [relatedAnimeQuery.data]);
  const similarAnime = useMemo(() => similarAnimeQuery?.data ?? [], [similarAnimeQuery.data]);
  const cast = useSeriesCastQuery(series.IDs.ID).data;

  const getThumbnailUrl = (item: SeriesCast, mode: string) => {
    const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
    if (thumbnail === null) return null;
    return `/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail.ID}`;
  };

  return (
    <>
      <title>{`${series.Name} > Overview | Shoko`}</title>
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
            {series && currentTab === 'metadata' && (
              <div
                className={cx(
                  'flex h-[15.625rem] flex-col gap-3 overflow-y-auto lg:gap-x-4 2xl:flex-nowrap 2xl:gap-x-6',
                  // TODO: The below needs to check for how many links are rendered, not how many types of links can exist
                  MetadataLinks.length > 4 ? 'pr-4' : '',
                )}
              >
                {MetadataLinks.map((site) => {
                  if (site === 'TMDB') {
                    const tmdbIds = series.IDs.TMDB;
                    if (tmdbIds.Movie.length + tmdbIds.Show.length === 0) {
                      return <SeriesMetadata key={site} site={site} seriesId={series.IDs.ID} />;
                    }

                    return [
                      ...flatMap(tmdbIds, (ids, type: 'Movie' | 'Show') =>
                        ids.map(id => (
                          <SeriesMetadata
                            key={`${site}-${type}-${id}`}
                            site={site}
                            id={id}
                            seriesId={series.IDs.ID}
                            type={type}
                          />
                        ))),
                      /* Show row to add new TMDB links */
                      <SeriesMetadata key="TMDB-add-new" site="TMDB" seriesId={series.IDs.ID} />,
                    ];
                  }

                  // Site is not TMDB, so it's either a single ID or an array of IDs
                  const idOrIds = series?.IDs[site] ?? [0];
                  const linkIds = typeof idOrIds === 'number' ? [idOrIds] : idOrIds;
                  if (linkIds.length === 0) linkIds.push(0);

                  return linkIds.map(id => (
                    <SeriesMetadata key={`${site}-${id}`} site={site} id={id} seriesId={series.IDs.ID} />
                  ));
                })}
              </div>
            )}
            {series && currentTab === 'links' && (
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
              ? <EpisodeSummary seriesId={series.IDs.ID} episode={nextUpEpisodeQuery.data} nextUp />
              : (
                <div className="flex grow items-center justify-center font-semibold">
                  All available episodes have already been watched
                </div>
              )}
          </ShokoPanel>
        </div>
      </div>

      {relatedAnime.length > 0 && (
        <ShokoPanel
          title="Related Anime"
          className="w-full"
          transparent
          contentClassName={cx('!flex-row gap-x-6', relatedAnime.length > 7 && 'pb-4')}
        >
          {map(relatedAnime, item => (
            <SeriesPoster
              key={item.ID}
              image={item.Poster}
              title={item.Title}
              subtitle={item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2')}
              shokoId={item.ShokoID}
              anidbSeriesId={item.ID}
              inCollection={!!item.ShokoID}
            />
          ))}
        </ShokoPanel>
      )}

      {similarAnime.length > 0 && (
        <ShokoPanel
          title="Similar Anime"
          className="w-full"
          transparent
          contentClassName={cx('!flex-row gap-x-6', similarAnime.length > 7 && 'pb-4')}
        >
          {map(similarAnime, item => (
            <SeriesPoster
              key={item.ID}
              image={item.Poster}
              title={item.Title}
              subtitle={`${round(item.UserApproval.Value, 2)}% (${item.UserApproval.Votes} votes)`}
              shokoId={item.ShokoID}
              anidbSeriesId={item.ID}
              inCollection={!!item.ShokoID}
            />
          ))}
        </ShokoPanel>
      )}

      <ShokoPanel title="Top 20 Actors" className="w-full" transparent>
        <div className="z-10 flex w-full gap-x-6">
          {cast?.filter(credit => credit.RoleName === 'Actor' && credit.Character).slice(0, 20).map(seiyuu => (
            <div
              key={`${seiyuu.Character?.Name}-${Math.random() * (cast.length + (seiyuu.Character?.Name.length ?? 0))}`}
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
                <span className="line-clamp-1 text-ellipsis text-xl font-semibold">{seiyuu.Character?.Name}</span>
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
