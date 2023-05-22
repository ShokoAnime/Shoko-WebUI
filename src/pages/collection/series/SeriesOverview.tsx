import React from 'react';
import moment from 'moment';
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
  mdiCalendarMonthOutline,
  mdiClockTimeFourOutline,
  mdiFilmstrip,
  mdiPlusCircleOutline,
  mdiStarHalfFull,
} from '@mdi/js';

const links = ['tmdb', 'tvdb', 'mal', 'anilist', 'trakt'];

const getNextUpThumbnailUrl = (episode: EpisodeType) => {
  const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
  if (thumbnail === null) { return null; }
  return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
};
const getDuration = (duration) => {
  const minutes = moment.duration(duration).asMinutes();
  const intMinutes = Math.round(toNumber(minutes));
  return `${intMinutes} minutes`;
};
const NextUpEpisode = ({ nextUpEpisode }) => (
  <div className="flex space-x-8">
    <BackgroundImagePlaceholderDiv imageSrc={getNextUpThumbnailUrl(nextUpEpisode)} className="h-[13rem] w-[22.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
    <div className="flex flex-col space-y-4">
      <div className="mt-2 text-xl font-semibold text-font-main max-w-[93.75rem]">{nextUpEpisode.Name}</div>
      <div className="mt-5 space-x-4 flex flex-nowrap">
        <div className="space-x-2 flex">
          <Icon path={mdiFilmstrip} size={1} />
          <span>Episode {nextUpEpisode.AniDB?.EpisodeNumber}</span>
        </div>
        <div className="space-x-2 flex">
          <Icon path={mdiCalendarMonthOutline} size={1} />
          <span>{nextUpEpisode.AniDB?.AirDate}</span>
        </div>
        <div className="space-x-2 flex">
          <Icon path={mdiClockTimeFourOutline} size={1} />
          <span>{getDuration(nextUpEpisode.Duration)}</span>
        </div>
        <div className="space-x-2 flex">
          <Icon path={mdiStarHalfFull} size={1} />
          <span>{toNumber(nextUpEpisode.AniDB?.Rating.Value).toFixed(2)} ({nextUpEpisode.AniDB?.Rating.Votes} Votes)</span>
        </div>
      </div>
      <div className="line-clamp-3 text-font-main">
        {nextUpEpisode.AniDB?.Description}
      </div>
    </div>
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
          <ShokoPanel title="Episode on Deck" className="flex grow min-h-[18rem]" transparent>
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
        <ShokoPanel title="Related Anime" className="grow-0 flex" transparent>
          <div className="flex space-x-3 shoko-scrollbar">
            {related.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div key={`image-${thumbnail?.ID}`} className="items-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail?.ID}`} className="h-[19.875rem] w-[13.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  <span>{item.Title}</span>
                  <span className="text-highlight-2">{item.Relation}</span>
                </div>
              );
            })}
          </div>
        </ShokoPanel>
      </div>
      <div className="flex mt-9">
        <ShokoPanel title="Similar Anime" className="grow-0 flex" transparent>
          <div className="flex space-x-3 shoko-scrollbar">
            {similar.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div  key={`image-${thumbnail?.ID}`} className="items-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail?.ID}`} className="h-[19.875rem] w-[13.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  <span>{item.Title}</span>
                  <span className="text-highlight-2">{round(item.UserApproval.Value, 2)}% ({item.UserApproval.Votes} votes)</span>
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