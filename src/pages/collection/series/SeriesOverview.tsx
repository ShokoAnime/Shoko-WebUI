import React from 'react';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import { useParams } from 'react-router';
import { useGetSeriesQuery, useGetSeriesEpisodesQuery, useGetAniDBRelatedQuery, useGetAniDBSimilarQuery } from '../../../core/rtkQuery/splitV3Api/seriesApi';
import { SeriesAniDBRelatedType, SeriesAniDBSimilarType, SeriesDetailsType } from '../../../core/types/api/series';
import { EpisodeType } from '../../../core/types/api/episode';
import { get, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';
import { ImageType } from '../../../core/types/api/common';

const SeriesOverview = () => {
  const { seriesId } = useParams();
  if (!seriesId) { return null; }
  
  const seriesData = useGetSeriesQuery({ seriesId, includeDataFrom: ['AniDB'] });
  const series: SeriesDetailsType = seriesData?.data ?? {} as SeriesDetailsType;
  const episodesData = useGetSeriesEpisodesQuery({ seriesId: toNumber(seriesId) });
  const episodes: EpisodeType[] = episodesData?.data ?? [] as EpisodeType[];
  const relatedData = useGetAniDBRelatedQuery({ seriesId });
  const related: SeriesAniDBRelatedType[] = relatedData?.data ?? [] as SeriesAniDBRelatedType[];
  const similarData = useGetAniDBSimilarQuery({ seriesId });
  const similar: SeriesAniDBSimilarType[] = similarData?.data ?? [] as SeriesAniDBSimilarType[];
  
  
  return (
    <React.Fragment>
      <div className="flex space-x-9">
        <ShokoPanel title="Additional information" className="grow min-w-fit">
          <div className="font-semibold">Source</div>
          <div>--</div>
          <div className="font-semibold mt-2">Episodes</div>
          <div>{series.Sizes.Total.Episodes} episodes</div>
          <div>{series.Sizes.Total.Specials} episodes</div>
          <div className="font-semibold mt-2">Length</div>
          <div>-- Minutes/Episode</div>
          <div className="font-semibold mt-2">Status</div>
          <div>--</div>
          <div className="font-semibold mt-2">Season</div>
          <div>--</div>
          <div className="font-semibold mt-2">Studio</div>
          <div>--</div>
          <div className="font-semibold mt-2">Producers</div>
          <div>--</div>
          <div className="font-semibold mt-2">Links</div>
          <div>--</div>
        </ShokoPanel>
        <ShokoPanel title="Episodes on Deck" className="grow-0 flex">
          <div className="flex space-x-3 shoko-scrollbar">
            {episodes.map((item) => {
              const thumbnail :ImageType = get(item, 'TvDB.0.Thumbnail', {} as ImageType);
              return (
                <div className="items-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/TvDB/Thumb/${thumbnail?.ID}`} className="h-[13.375rem] w-[21.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  E{item.AniDB?.EpisodeNumber} - {item.Name}
                </div>
              );
            })}  
          </div>
        </ShokoPanel>
      </div>
      <div className="flex mt-9">
        <ShokoPanel title="Related Anime" className="grow-0 flex">
          <div className="flex space-x-3 shoko-scrollbar">
            {related.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div className="items-center flex flex-col">
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
        <ShokoPanel title="Similar Anime" className="grow-0 flex">
          <div className="flex space-x-3 shoko-scrollbar">
            {similar.map((item) => {
              const thumbnail :ImageType = get(item, 'Poster', {} as ImageType);
              return (
                <div className="items-center flex flex-col">
                  <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${thumbnail.Source}/${thumbnail.Type}/${thumbnail?.ID}`} className="h-[19.875rem] w-[13.875rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
                  <span>{item.Title}</span>
                  <span className="text-highlight-2">{item.UserApproval.Votes} votes</span>
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