import { useParams } from 'react-router';
import { useGetSeriesEpisodesQuery } from '../../../core/rtkQuery/splitV3Api/seriesApi';
import { EpisodeType } from '../../../core/types/api/episode';
import { get, toNumber } from 'lodash';
import BackgroundImagePlaceholderDiv from '../../../components/BackgroundImagePlaceholderDiv';
import { Icon } from '@mdi/react';
import { mdiCalendarMonthOutline, mdiClockTimeFourOutline, mdiEyeCheckOutline, mdiEyeOutline, mdiFilmstrip, mdiStarHalfFull } from '@mdi/js';
import ShokoPanel from '../../../components/Panels/ShokoPanel';
import React from 'react';
import { ImageType } from '../../../core/types/api/common';
import moment from 'moment/moment';

const SeriesEpisodes = () => {
  const { seriesId } = useParams();

  const episodesData = useGetSeriesEpisodesQuery({ seriesId: toNumber(seriesId) });
  const episodes: EpisodeType[] = episodesData?.data?.List ?? [] as EpisodeType[];
  const episodesTotal: number = episodesData?.data?.Total ?? 0;

  const getThumbnailUrl = (episode: EpisodeType) => {
    const thumbnail = get<EpisodeType, string, ImageType | null>(episode, 'TvDB.0.Thumbnail', null);
    if (thumbnail === null) { return null; }
    return `/api/v3/Image/TvDB/Thumb/${thumbnail.ID}`;
  };

  const getDuration = (duration) => {
    const minutes = moment.duration(duration).asMinutes();
    const intMinutes = Math.round(toNumber(minutes));
    return `${intMinutes} minutes`;
  };
  
  const renderEpisode = episode => (
    <React.Fragment>
      <div className="flex space-x-8">
        <BackgroundImagePlaceholderDiv imageSrc={getThumbnailUrl(episode)} className="h-[8.4375rem] min-w-[15rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
        <div className="flex flex-col space-y-4 grow">
          <div className="mt-2 flex justify-between">
            <span className="text-xl font-semibold text-font-main">{episode.Name}</span>
            <Icon className="text-highlight-1" path={episode.Watched === null ? mdiEyeOutline : mdiEyeCheckOutline} size={1} />
          </div>
          <div className="mt-5 space-x-4 flex flex-nowrap">
            <div className="space-x-2 flex">
              <Icon path={mdiFilmstrip} size={1} />
              <span>Episode {episode.AniDB?.EpisodeNumber}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiCalendarMonthOutline} size={1} />
              <span>{episode.AniDB?.AirDate}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiClockTimeFourOutline} size={1} />
              <span>{getDuration(episode.Duration)}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiStarHalfFull} size={1} />
              <span>{toNumber(episode.AniDB?.Rating.Value).toFixed(2)} ({episode.AniDB?.Rating.Votes} Votes)</span>
            </div>
          </div>
          <div className="line-clamp-3 text-font-main">
            {episode.AniDB?.Description}
          </div>
        </div>
      </div>
      <div className="border-background-border border-b-2"/>
    </React.Fragment>
  );
  
  return (
    <React.Fragment>
      <div className="flex space-x-9">
        <ShokoPanel title="Episodes" className="flex  flex-col grow">
          <div className="my-4 p-3 flex justify-between bg-background-nav border-background-border">
            <div className="flex space-x-3">
              <div className="space-x-2 flex">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span>Mark All Watched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeOutline} size={1} />
                <span>Mark All Unwatched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span>Mark Range Watched</span>
              </div>
              <div className="space-x-2 flex">
                <Icon path={mdiEyeOutline} size={1} />
                <span>Mark Range Unwatched</span>
              </div>
            </div>
            <div className="font-semibold">
              <span className="text-highlight-2 mr-2">{episodesTotal}</span>
              Episodes
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            {episodes.length > 0 ? episodes.map(item => renderEpisode(item)) : 'No episodes'}
          </div>
        </ShokoPanel>
        <div className="grow-0 w-[23rem]">
          Filter panel
        </div>
      </div>
    </React.Fragment>
  );
};


export default SeriesEpisodes;