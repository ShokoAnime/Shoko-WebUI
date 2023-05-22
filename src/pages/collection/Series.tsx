import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { useGetSeriesQuery, useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesDetailsType } from '@/core/types/api/series';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { Icon } from '@mdi/react';
import {
  mdiAccountGroupOutline,
  mdiCalendarMonthOutline,
  mdiEyeOutline,
  mdiFileDocumentMultipleOutline,
  mdiFilmstrip,
  mdiHarddisk,
  mdiImageMultipleOutline,
  mdiInformationOutline,
  mdiSquareEditOutline,
  mdiTagTextOutline,
  mdiTelevision,
} from '@mdi/js';
import { TagType } from '@/core/types/api/tags';
import cx from 'classnames';
import AnidbDescription from './items/AnidbDescription';
import { Link, NavLink, useOutletContext } from 'react-router-dom';
import { get, isArray, random } from 'lodash';

const IconNotification = ({ text }) => (
  <div className="flex items-center font-semibold">
    <Icon path={mdiInformationOutline} size={1} className="text-highlight-2"/>
    <div className="flex flex-col ml-3">
      {text}
    </div>
  </div>
);

const SeriesTab = ({ to, icon, text, active = false }) => (
  <NavLink to={to}   className={({ isActive, isPending }) =>
    isPending ? 'pending' : isActive ? 'text-highlight-1' : ''
  }>
    <div className="flex items-center font-semibold cursor-pointer">
      <Icon path={icon} size={1} className={cx(active && 'text-highlight-1')}/>
      <div className={cx('flex flex-col ml-3', active && 'text-highlight-1')}>
        {text}
      </div>
    </div>
  </NavLink>
);

const SeriesTag = ({ text, type }) => (
  <div className={cx('text-xs font-semibold flex space-x-2 items-center border-2 border-[rgba(63,71,98,1)] rounded-[10px] p-2 whitespace-nowrap', type === 'User' ? 'text-highlight-2' : 'text-highlight-1')}>
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-font-main">{text}</span>
  </div>
);

const Series = () => {
  const { seriesId } = useParams();
  const [ fanartUri, setFanartUri ] = useState('');

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();
  
  if (!seriesId) { return null; }
  
  const seriesData = useGetSeriesQuery({ seriesId, includeDataFrom: ['AniDB'] });
  const series: SeriesDetailsType = seriesData?.data ?? {} as SeriesDetailsType;
  const tagsData = useGetSeriesTagsQuery({ seriesId, excludeDescriptions: true });
  const tags: TagType[] = tagsData?.data ?? [] as TagType[];
  
  useEffect(() => {
    const fanarts = get(series, 'Images.Fanarts', []);
    if (!isArray(fanarts) || fanarts.length === 0)  { return; }
    const randomIdx = fanarts.length > 1 ? random(0, fanarts.length) : 0;
    const randomImage = fanarts[randomIdx];
    setFanartUri(`/api/v3/Image/${randomImage.Source}/${randomImage.Type}/${randomImage.ID}`);
  }, [series]);

  if (!seriesData.isSuccess) { return null; }
  
  return (
    <div className="p-8 h-full min-w-full relative">
      <div className="flex w-auto space-x-16 rounded bg-background-alt/25 p-8 border-background-border border">
        <div className="grow flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <Link className="text-highlight-1" to="/webui/collection">Entire Collection</Link>
              <span className="px-2">&gt;</span>
            </div>
            <div className="flex space-x-2">
              <IconNotification text="Series is Ongoing" />
              <IconNotification text="New Files Added Recently" />
            </div>
          </div>
          <div className="mt-2 text-4xl font-semibold text-font-main max-w-[93.75rem]">{series.Name}</div>
          <div className="mt-5 text-xl font-semibold text-font-main text-opacity-60">{series.AniDB?.Title}</div>
          <div className="mt-5 space-x-4 flex flex-nowrap">
            <div className="space-x-2 flex">
              <Icon path={mdiTelevision} size={1} />
              <span>{series?.AniDB?.Type}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiCalendarMonthOutline} size={1} />
              <span>{series?.AniDB?.AirDate} - {series?.AniDB?.EndDate === null ? 'Ongoing' : series?.AniDB?.EndDate}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiFileDocumentMultipleOutline} size={1} />
              <span>{series?.Sizes.Local.Episodes} / {series?.Sizes.Total.Episodes}</span>
              <span className="px-2">|</span>
              <span>{series?.Sizes.Local.Specials} / {series?.Sizes.Total.Specials}</span>
            </div>
            <div className="space-x-2 flex">
              <Icon path={mdiEyeOutline} size={1} />
              <span>{series?.Sizes.Watched.Episodes} / {series?.Sizes.Total.Episodes}</span>
              <span className="px-2">|</span>
              <span>{series?.Sizes.Watched.Specials} / {series?.Sizes.Total.Specials}</span>
            </div>
          </div>
          <div className="mt-5 space-x-4 flex flex-nowrap">
            {tags.slice(0, 10).map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source}/>)}
          </div>
          <div className="mt-8 line-clamp-3 max-w-[93.75rem] text-font-main min-h-[5rem] bg-gradient-to-t from-transparent to-white bg-clip-text text-fill-transparent">
            <AnidbDescription text={series?.AniDB?.Description} />
          </div>
          <div className="mt-auto space-x-8 flex flex-nowrap">
            <SeriesTab to="overview" icon={mdiInformationOutline} text="Overview" />
            <SeriesTab to="episodes" icon={mdiFilmstrip} text="Episodes" />
            <SeriesTab to="credits" icon={mdiAccountGroupOutline} text="Credits" />
            <SeriesTab to="images" icon={mdiImageMultipleOutline} text="Images" />
            <SeriesTab to="tags" icon={mdiTagTextOutline} text="Tags" />
            <SeriesTab to="files" icon={mdiHarddisk} text="Files" />
            <SeriesTab to="edit" icon={mdiSquareEditOutline} text="Edit" />
          </div>
        </div>
        <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${series.Images.Posters[0].Source}/Poster/${series.Images.Posters[0].ID}`} className="h-[23.875rem] w-[18.5rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
      </div>
      <div className="mt-8 flex flex-col">
        <Outlet context={{ scrollRef }} />
      </div>
      <div className="h-full w-full top-0 left-0 fixed opacity-5 -z-10" style={{ background: fanartUri !== '' ? `center / cover no-repeat url('${fanartUri}')` : undefined }} />
    </div>
  );
};

export default Series;