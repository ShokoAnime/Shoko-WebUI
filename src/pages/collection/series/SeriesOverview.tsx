import React from 'react';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import {
  useGetAniDBRelatedQuery,
  useGetAniDBSimilarQuery,
  useGetSeriesQuery,
  useNextUpEpisodeQuery,
} from '@/core/rtkQuery/splitV3Api/seriesApi';
import { useGetSeriesOverviewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';
import { SeriesAniDBRelatedType, SeriesAniDBSimilarType, SeriesDetailsType } from '@/core/types/api/series';
import { EpisodeType } from '@/core/types/api/episode';
import { get, map, round, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { ImageType } from '@/core/types/api/common';
import { WebuiSeriesDetailsType } from '@/core/types/api/webui';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
  mdiPlusCircleOutline,
} from '@mdi/js';
import { EpisodeDetails } from '@/pages/collection/items/EpisodeDetails';

const links = ['tmdb', 'tvdb', 'mal', 'anilist', 'trakt'];

const getNextUpThumbnailUrl = (episode: EpisodeType) => {
  const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};

const NextUpEpisode = ({ nextUpEpisode }) => (
  <div className="flex space-x-8">
    <BackgroundImagePlaceholderDiv imageSrc={getNextUpThumbnailUrl(nextUpEpisode)} className="min-w-[22.3125rem] h-[13rem] rounded-md border border-background-border relative"/>
    <EpisodeDetails episode={nextUpEpisode} />
  </div>
);

const SeriesOverview = () => {
  const { seriesId } = useParams();
  if (!seriesId) { return null; }
  
  const seriesData = useGetSeriesQuery({ seriesId, includeDataFrom: ['AniDB'] });
  const series: SeriesDetailsType = seriesData?.data ?? {} as SeriesDetailsType;
  const seriesOverviewData = useGetSeriesOverviewQuery({ SeriesID: seriesId });
  const overview = seriesOverviewData?.data || {} as WebuiSeriesDetailsType;
  const nextUpEpisodeData = useNextUpEpisodeQuery({ seriesId: toNumber(seriesId) });
  const nextUpEpisode: EpisodeType = nextUpEpisodeData?.data ?? {} as EpisodeType;
  const relatedData = useGetAniDBRelatedQuery({ seriesId });
  const related: SeriesAniDBRelatedType[] = relatedData?.data ?? [] as SeriesAniDBRelatedType[];
  const similarData = useGetAniDBSimilarQuery({ seriesId });
  const similar: SeriesAniDBSimilarType[] = similarData?.data ?? [] as SeriesAniDBSimilarType[];
  
  const renderMetadataLink = site => (
    <div key={site} className="flex justify-between">
      <div className="flex space-x-5">
        <div className={`metadata-link-icon ${site}`}/>
        <span>Series Not Linked</span>
      </div>
      <div>
        <Icon className="text-highlight-1" path={mdiPlusCircleOutline} size={1} />
      </div>
    </div>
  );
  
  return (
    <React.Fragment>
      <div className="flex space-x-9">
        <ShokoPanel title="Additional information" className="grow-0 min-w-fit" transparent>
          <div className="font-semibold">Source</div>
          <div>{overview.SourceMaterial}</div>
          <div className="font-semibold mt-2">Episodes</div>
          <div>{series.Sizes.Total.Episodes} episodes</div>
          <div>{series.Sizes.Total.Specials} episodes</div>
          <div className="font-semibold mt-2">Length</div>
          <div>-- Minutes/Episode</div>
          <div className="font-semibold mt-2">Status</div>
          <div>--</div>
          <div className="font-semibold mt-2">Season</div>
          <div>{overview?.FirstAirSeason && <Link className="text-highlight-1" to={`/webui/collection/filter/${overview.FirstAirSeason.IDs.ID}`}>{overview.FirstAirSeason.Name}</Link>}</div>
          <div className="font-semibold mt-2">Studio</div>
          <div className="flex flex-col">{map(overview.Studios, item => <span>{item.Name}</span>)}</div>
          <div className="font-semibold mt-2">Producers</div>
          <div className="flex flex-col">{map(overview.Producers, item => <span>{item.Name}</span>)}</div>
          <div className="font-semibold mt-2">Links</div>
          <div className="flex flex-col">{map(series.Links, item => <span>{item.name}</span>)}</div>
        </ShokoPanel>
        <div className="flex flex-col space-y-9 grow">
          <ShokoPanel title="Episode on Deck" className="flex grow min-h-[22rem]" transparent>
            {get(nextUpEpisode, 'Name', false) ? <NextUpEpisode nextUpEpisode={nextUpEpisode} /> : <div className="flex grow justify-center items-center font-semibold">No episode data available!</div>}
          </ShokoPanel>
          <ShokoPanel title="Metadata Sites" className="flex grow-0" transparent>
            <div className="columns-2 gap-8 space-y-5">
              {links.map(site => renderMetadataLink(site))}
            </div>
          </ShokoPanel>
        </div>
      </div>
      <div className="flex mt-9">
        <ShokoPanel title="Related Anime" className="w-full" transparent>
          <div className="flex gap-x-4 shoko-scrollbar">
            {related.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              const itemRelation = item.Relation.replace(/([a-z])([A-Z])/g, '$1 $2');
              return (
                <div key={`image-${thumbnail?.ID}`} className="shrink-0 w-[14.0625rem] content-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail?.ID}`} className="h-[19.875rem] w-[13.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  <span className='text-center text-sm font-semibold text-ellipsis line-clamp-1 mb-2'>{item.Title}</span>
                  <span className="text-center text-sm font-semibold text-highlight-2">{itemRelation}</span>
                </div>
              );
            })}
          </div>
        </ShokoPanel>
      </div>
      <div className="flex mt-9">
        <ShokoPanel title="Similar Anime" className="w-full" transparent>
          <div className="flex gap-x-4 shoko-scrollbar">
            {similar.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div key={`image-${thumbnail?.ID}`} className="shrink-0 w-[14.0625rem] content-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail?.ID}`} className="h-[19.875rem] w-[13.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  <span className='text-center text-sm font-semibold text-ellipsis line-clamp-1 mb-2'>{item.Title}</span>
                  <span className="text-center text-sm font-semibold text-highlight-2">{round(item.UserApproval.Value, 2)}% ({item.UserApproval.Votes} votes)</span>
                </div>
              );
            })}
          </div>
        </ShokoPanel>
      </div>
    </React.Fragment>
  );
};

export default SeriesOverview;