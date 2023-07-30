import React, { useMemo } from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { get, round, toNumber } from 'lodash';
import { Icon } from '@mdi/react';
import {
  mdiChevronRight,
  mdiCloseCircleOutline,
  mdiOpenInNew, mdiPencilCircleOutline,
  mdiPlusCircleOutline,
} from '@mdi/js';
import moment from 'moment';

import {
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useGetSeriesQuery,
  useNextUpEpisodeQuery,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { useGetSeriesOverviewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { SeriesAniDBRelatedType, SeriesAniDBSimilarType, SeriesDetailsType } from '@/core/types/api/series';
import { EpisodeType } from '@/core/types/api/episode';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { ImageType } from '@/core/types/api/common';
import { WebuiSeriesDetailsType } from '@/core/types/api/webui';
import EpisodeDetails from '@/components/Collection/Series/EpisodeDetails';
import Button from '@/components/Input/Button';
import useEpisodeThumbnail from '@/hooks/useEpisodeThumbnail';

const links = ['TMDB', 'TvDB', 'MAL', 'AniList', 'TraktTv'];

const NextUpEpisode = ({ nextUpEpisode }: { nextUpEpisode: EpisodeType }) => {
  const thumbnail = useEpisodeThumbnail(nextUpEpisode);
  return (
    <div className="flex gap-x-8 items-center z-10">
      <BackgroundImagePlaceholderDiv image={thumbnail} className="min-w-[22.3125rem] h-[13rem] rounded-md border border-panel-border relative" />
      <EpisodeDetails episode={nextUpEpisode} />
    </div>
  );
};

const MetadataLink = ({ site, id, series }: { site: string, id: number | number[], series: string }) => {
  const linkId = Array.isArray(id) ? id[0] : id;

  const siteLink = useMemo(() => {
    switch (site) {
      case 'TMDB':
        return `https://www.themoviedb.org/movie/${linkId}`;
      case 'TvDB':
        // TODO: Figure how to get tvdb series link using ID
        return '#';
      case 'MAL':
        return `https://myanimelist.net/anime/${linkId}`;
      case 'AniList':
        return `https://anilist.co/anime/${linkId}`;
      case 'TraktTv':
        // TODO: Figure how to get trakt series link using ID
        return '#';
      default:
        return '#';
    }
  }, [linkId, site]);

  return (
    <div key={site} className="flex justify-between">
      <div className="flex gap-x-2">
        <div className={`metadata-link-icon ${site}`} />
        {linkId ? (
          <a href={siteLink} className="flex gap-x-2 text-panel-primary font-semibold" rel="noopener noreferrer" target="_blank">
            {/* TODO: Use name from metadata source instead of series name in Shoko */}
            {`${series} (${linkId})`}
            <Icon path={mdiOpenInNew} size={1} />
          </a>
        ) : 'Series Not Linked'}
      </div>
      <div className="flex gap-x-2">
        {linkId ? (
          <>
            <Button disabled>
              <Icon className="text-panel-primary" path={mdiPencilCircleOutline} size={1} />
            </Button>
            <Button disabled>
              <Icon className="text-panel-danger" path={mdiCloseCircleOutline} size={1} />
            </Button>
          </>
        ) : (
          <Button disabled>
            <Icon className="text-panel-primary" path={mdiPlusCircleOutline} size={1} />
          </Button>
        )}
      </div>
    </div>
  );
};

const SeriesOverview = () => {
  const { seriesId } = useParams();

  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series: SeriesDetailsType = useMemo(() => seriesData?.data ?? {} as SeriesDetailsType, [seriesData]);
  const seriesOverviewData = useGetSeriesOverviewQuery({ SeriesID: seriesId! }, { skip: !seriesId });
  const overview = seriesOverviewData?.data || {} as WebuiSeriesDetailsType;
  const nextUpEpisodeData = useNextUpEpisodeQuery({ seriesId: toNumber(seriesId) });
  const nextUpEpisode: EpisodeType = nextUpEpisodeData?.data ?? {} as EpisodeType;
  const relatedData = useGetAniDBRelatedQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const related: SeriesAniDBRelatedType[] = relatedData?.data ?? [] as SeriesAniDBRelatedType[];
  const similarData = useGetAniDBSimilarQuery({ seriesId: seriesId! }, { skip: !seriesId });
  const similar: SeriesAniDBSimilarType[] = similarData?.data ?? [] as SeriesAniDBSimilarType[];

  const jpOfficialSite = useMemo(() => series.Links.find(link => link.Name === 'Official Site (JP)'), [series]);
  const enOfficialSite = useMemo(() => series.Links.find(link => link.Name === 'Official Site (EN)'), [series]);

  if (!seriesId) return null;

  return (
    <React.Fragment>
      <div className="flex gap-x-8">
        <ShokoPanel title="Additional information" className="min-w-fit" transparent contentClassName="gap-y-4">

          <div className="flex flex-col gap-y-1 capitalize">
            <div className="font-semibold">Source</div>
            {overview.SourceMaterial}
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Episodes</div>
            <div>{series.Sizes.Total.Episodes} Episodes</div>
            <div>{series.Sizes.Total.Specials} Specials</div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Length</div>
            {/* TODO: Get episode length */}
            <div>-- Minutes/Episode</div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Status</div>
            {/* TODO: Check if there are more status types */}
            {(series.AniDB?.EndDate && moment(series.AniDB?.EndDate) < moment()) ? 'Finished' : 'Ongoing'}
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Season</div>
            {overview?.FirstAirSeason ? <Link className="text-panel-primary font-semibold" to={`/webui/collection/filter/${overview.FirstAirSeason.IDs.ID}`}>{overview.FirstAirSeason.Name}</Link> : '--'}
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Studio</div>
            <div>{overview?.Studios?.[0] ? overview?.Studios?.[0].Name : 'Studio Not Listed'}</div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Producers</div>
            {overview?.Producers?.map(item => <div key={item.Name}>{item.Name}</div>)}
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="font-semibold">Links</div>
            {/* TODO: Only showing links with Official JP and EN sites for now. To be changed */}
            {jpOfficialSite && (
              <a href={jpOfficialSite.URL} rel="noopener noreferrer" target="_blank" key={jpOfficialSite.Name} className="text-panel-primary font-semibold">
                {jpOfficialSite.Name}
              </a>
            )}
            {enOfficialSite && (
              <a href={enOfficialSite.URL} rel="noopener noreferrer" target="_blank" key={enOfficialSite.Name} className="text-panel-primary font-semibold">
                {enOfficialSite.Name}
              </a>
            )}
          </div>

        </ShokoPanel>

        <div className="flex flex-col gap-y-8 grow">
          <ShokoPanel title="Episode on Deck" className="flex grow" transparent>
            {get(nextUpEpisode, 'Name', false) ? <NextUpEpisode nextUpEpisode={nextUpEpisode} /> : <div className="flex grow justify-center items-center font-semibold">No Episode Data Available!</div>}
          </ShokoPanel>
          <ShokoPanel
            title={(
              <div className="flex gap-x-2">
                Metadata Sites
                <Icon path={mdiChevronRight} size={1} />
                <a href={`https://anidb.net/anime/${series.IDs.AniDB}`} className="flex gap-x-2 text-panel-primary items-center" rel="noopener noreferrer" target="_blank">
                  <div className="metadata-link-icon anidb" />
                  <div>{series.AniDB?.Title}</div>
                  <Icon path={mdiOpenInNew} size={1} />
                </a>
              </div>
            )}
            className="flex grow-0"
            transparent
          >
            <div className="grid grid-rows-3 grid-cols-2 gap-x-9 gap-y-4">
              {links.map(site => (
                <div className="bg-panel-background border border-panel-border px-4 py-3 rounded">
                  <MetadataLink key={site} site={site} id={series.IDs[site]} series={series.Name} />
                </div>
              ))}
            </div>
          </ShokoPanel>
        </div>
      </div>

      {related.length > 0 && (
        <ShokoPanel title="Related Anime" className="w-full" transparent>
          <div className="flex gap-x-5">
            {related.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              const itemRelation = item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2');
              return (
                <div key={`image-${thumbnail?.ID}`} className="shrink-0 w-[13.875rem] flex flex-col gap-y-2 text-center text-sm font-semibold">
                  <BackgroundImagePlaceholderDiv image={thumbnail} className="h-[19.875rem] w-[13.875rem] rounded-md drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border" />
                  <span className="text-ellipsis line-clamp-1">{item.Title}</span>
                  <span className="text-panel-important">{itemRelation}</span>
                </div>
              );
            })}
          </div>
        </ShokoPanel>
      )}

      {similar.length > 0 && (
        <ShokoPanel title="Similar Anime" className="w-full" transparent>
          <div className="flex gap-x-5 shoko-scrollbar">
            {similar.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div key={`image-${thumbnail?.ID}`} className="shrink-0 w-[13.875rem] flex flex-col gap-y-2 text-center text-sm font-semibold">
                  <BackgroundImagePlaceholderDiv image={thumbnail} className="h-[19.875rem] w-[13.875rem] rounded-md drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border" />
                  <span className="text-ellipsis line-clamp-1">{item.Title}</span>
                  <span className="text-panel-important">{round(item.UserApproval.Value, 2)}% ({item.UserApproval.Votes} votes)</span>
                </div>
              );
            })}
          </div>
        </ShokoPanel>
      )}
    </React.Fragment>
  );
};

export default SeriesOverview;
