import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import { mdiEarth, mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { get, map, round, sortBy } from 'lodash';

import CharacterImage from '@/components/CharacterImage';
import EpisodeSummary from '@/components/Collection/Episode/EpisodeSummary';
import SeriesMetadataLink from '@/components/Collection/SeriesMetadataLink';
import SeriesSourceLinks from '@/components/Collection/SeriesSourceLinks';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import SeriesPoster from '@/components/SeriesPoster';
import { isAnidbSource, isSameKey, isTmdbSource } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery } from '@/core/react-query/metadata/queries';
import {
  useRelatedAnimeQuery,
  useSeriesCastQuery,
  useSeriesNextUpQuery,
  useSimilarAnimeQuery,
} from '@/core/react-query/series/queries';
import { getAnidbAnimeLink } from '@/core/util';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { ImageType } from '@/core/types/api/common';
import type { SeriesCast } from '@/core/types/api/series';

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

  // Every source but AniDB, TMDB first: the ones that can be linked, and any other the series is still linked to,
  // which the linking page does not know, so those are shown read-only.
  // Nothing is listed until the sources are known, as a linked source cannot be told from an unlisted one before.
  const sourcesQuery = useMetadataLinkSourcesQuery();
  const linkedIds = series.IDs.Linked;
  const findLinkedIds = (source: string) =>
    Object.entries(linkedIds).find(([key]) => isSameKey(key, source))?.[1] ?? [];
  const otherSources = sortBy(
    !sourcesQuery.isSuccess ? [] : [
      ...sourcesQuery.data.map(item => ({
        canLink: item.IsSeriesEnabled || item.IsMovieEnabled,
        linkedIds: findLinkedIds(item.Source),
        name: item.Name,
        readOnly: false,
        source: item.Source,
      })),
      ...Object.entries(linkedIds)
        .filter(([key]) => !isAnidbSource(key) && !sourcesQuery.data.some(item => isSameKey(item.Source, key)))
        .map(([key, ids]) => ({ canLink: false, linkedIds: ids, name: key, readOnly: true, source: key })),
    ],
    item => !isTmdbSource(item.source),
  );
  // The AniDB row, then one row per link and per source that can be linked.
  const linkRowCount = 1
    + otherSources.reduce((count, item) => count + item.linkedIds.length + (item.canLink ? 1 : 0), 0);

  const getThumbnailUrl = (item: SeriesCast, mode: string) => {
    const thumbnail = get<SeriesCast, string, ImageType | null>(item, `${mode}.Image`, null);
    if (thumbnail === null) return null;
    return `/api/v3/Image/${thumbnail.UID}`;
  };

  return (
    <>
      <title>{`${series.Name} > Overview | Shoko`}</title>
      <div className="flex gap-x-6">
        <div className="flex w-full gap-x-6">
          <ShokoPanel
            title="Metadata Sites"
            className="flex w-full max-w-150"
            transparent
            disableOverflow
            options={
              <MultiStateButton states={tabStates} activeState={currentTab} onStateChange={handleTabStateChange} />
            }
          >
            {series && currentTab === 'metadata' && (
              <div
                className={cx(
                  'flex h-62.5 flex-col gap-3 overflow-y-auto lg:gap-x-4 2xl:flex-nowrap 2xl:gap-x-6',
                  linkRowCount > 4 ? 'pr-4' : '',
                )}
              >
                <SeriesMetadataLink
                  source="AniDB"
                  id={series.IDs.AniDB}
                  seriesId={series.IDs.ID}
                  siteUrl={getAnidbAnimeLink(series.IDs.AniDB)}
                />
                {otherSources.map(item => (
                  <SeriesSourceLinks
                    key={item.source}
                    canLink={item.canLink}
                    linkedIds={item.linkedIds}
                    name={item.name}
                    readOnly={item.readOnly}
                    seriesId={series.IDs.ID}
                    source={item.source}
                  />
                ))}
              </div>
            )}
            {series && currentTab === 'links' && (
              <div
                className={cx(
                  'flex h-62.5 flex-col gap-3 overflow-y-auto',
                  series.Links.length > 4 ? 'pr-4' : '',
                )}
              >
                {series.Links.map(link => (
                  <a
                    className="flex w-full gap-x-2 rounded-lg border border-panel-border bg-panel-background px-4 py-3 text-left text-base! font-normal! text-panel-icon-action hover:bg-panel-toggle-background-hover"
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
          contentClassName={cx('flex-row! gap-x-6', relatedAnime.length > 7 && 'pb-4')}
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
          contentClassName={cx('flex-row! gap-x-6', similarAnime.length > 7 && 'pb-4')}
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
          {cast?.filter(credit => credit.RoleName === 'Actor' && credit.Character).slice(0, 20).map((seiyuu, index) => (
            <div
              // Index-only key: the list is a static slice (no reordering/insertion), the items
              // are stateless display elements, and React just updates content in place on data
              // changes — no remount churn.
              // oxlint-disable-next-line react/no-array-index-key -- index uniquely identifies items in this static slice
              key={index}
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
                <span className="line-clamp-1 text-xl font-semibold text-ellipsis">{seiyuu.Character?.Name}</span>
                <span className="line-clamp-1 text-sm font-semibold text-ellipsis opacity-65">
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
