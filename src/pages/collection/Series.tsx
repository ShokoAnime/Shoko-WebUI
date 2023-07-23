import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import moment from 'moment';
import { Link, NavLink, useOutletContext } from 'react-router-dom';
import { get, isArray, random } from 'lodash';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiAccountGroupOutline,
  mdiCalendarMonthOutline, mdiChevronRight,
  mdiEyeOutline,
  mdiFileDocumentMultipleOutline,
  mdiFilmstrip,
  mdiImageMultipleOutline,
  mdiInformationOutline, mdiPencilCircleOutline,
  mdiTagTextOutline,
  mdiTelevision,
} from '@mdi/js';

import { useGetSeriesQuery, useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { SeriesDetailsType } from '@/core/types/api/series';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { TagType } from '@/core/types/api/tags';
import AnidbDescription from '@/components/Collection/AnidbDescription';
import { useGetGroupQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { CollectionGroupType } from '@/core/types/api/collection';

const IconNotification = ({ text }) => (
  <div className="flex items-center font-semibold gap-x-2">
    <Icon path={mdiInformationOutline} size={1} className="text-highlight-2" />
    <div className="flex flex-col">
      {text}
    </div>
  </div>
);

const SeriesTab = ({ to, icon, text }) => (
  <NavLink to={to} className={({ isActive }) => cx('flex items-center gap-x-2', isActive && 'text-highlight-1', to === 'edit' && 'ml-auto pointer-events-none opacity-50')}>
    <Icon path={icon} size={1} />
    {text}
  </NavLink>
);

const SeriesTag = ({ text, type }) => (
  <div className={cx('text-xs font-semibold flex gap-x-2 items-center border-2 border-border-alt rounded-md p-2 whitespace-nowrap capitalize', type === 'User' ? 'text-highlight-2' : 'text-highlight-1')}>
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-font-main">{text}</span>
  </div>
);

const Series = () => {
  const { seriesId } = useParams();
  const [fanartUri, setFanartUri] = useState('');

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series = useMemo(() => seriesData?.data ?? {} as SeriesDetailsType, [seriesData]);
  const tagsData = useGetSeriesTagsQuery({ seriesId: seriesId!, excludeDescriptions: true }, { skip: !seriesId });
  const tags: TagType[] = tagsData?.data ?? [] as TagType[];
  const groupData = useGetGroupQuery({ groupId: series.IDs?.ParentGroup }, { skip: !series.IDs?.ParentGroup });
  const group = groupData?.data ?? {} as CollectionGroupType;

  useEffect(() => {
    const fanarts = get(series, 'Images.Fanarts', []);
    if (!isArray(fanarts) || fanarts.length === 0) { return; }
    const randomIdx = fanarts.length > 1 ? random(0, fanarts.length) : 0;
    const randomImage = fanarts[randomIdx];
    setFanartUri(`/api/v3/Image/${randomImage.Source}/${randomImage.Type}/${randomImage.ID}`);
  }, [series]);

  const isSeriesOngoing = useMemo(() => {
    if (!series.AniDB?.EndDate) return true;
    return moment(series.AniDB.EndDate) > moment();
  }, [series]);

  if (!seriesId || !seriesData.isSuccess) return null;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex w-full gap-x-8 rounded-md bg-background-alt/50 p-8 border-background-border border">
        <div className="grow flex flex-col gap-y-2">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <Link className="font-semibold text-highlight-1" to="/webui/collection">Entire Collection</Link>
              <Icon path={mdiChevronRight} size={1} />
              <Link className="font-semibold text-highlight-1" to={`/webui/collection/group/${series.IDs?.ParentGroup}`}>{group.Name}</Link>
              <Icon path={mdiChevronRight} size={1} />
            </div>
            <div className="flex gap-x-3">
              {isSeriesOngoing && <IconNotification text="Series is Ongoing" />}
              {/* TODO: Check whether new files are added */}
              {/* <IconNotification text="New Files Added Recently" /> */}
            </div>
          </div>
          <div className="flex flex-col gap-y-4 max-w-[56.25rem]">
            <div className="text-4xl font-semibold">{series.Name}</div>
            <div className="text-xl font-semibold opacity-65">{series.AniDB?.Titles.find(title => title.Type === 'Main')?.Name}</div>
            <div className="gap-x-4 flex flex-nowrap text-sm">
              <div className="gap-x-2 flex items-center">
                <Icon path={mdiTelevision} size={1} />
                <span>{series?.AniDB?.Type}</span>
              </div>
              <div className="gap-x-2 flex items-center">
                <Icon path={mdiCalendarMonthOutline} size={1} />
                <span>{moment(series?.AniDB?.AirDate).format('MMM DD, YYYY')} - {series?.AniDB?.EndDate === null ? 'Current' : moment(series?.AniDB?.EndDate).format('MMM DD, YYYY')}</span>
              </div>
              <div className="gap-x-2 flex items-center">
                <Icon path={mdiFileDocumentMultipleOutline} size={1} />
                {`${series?.Sizes.Local.Episodes} / ${series?.Sizes.Total.Episodes} | ${series?.Sizes.Local.Specials} / ${series?.Sizes.Total.Specials}`}
              </div>
              <div className="gap-x-2 flex items-center">
                <Icon path={mdiEyeOutline} size={1} />
                {`${series?.Sizes.Watched.Episodes} / ${series?.Sizes.Total.Episodes} | ${series?.Sizes.Watched.Specials} / ${series?.Sizes.Total.Specials}`}
              </div>
            </div>
            <div className="gap-x-4 flex flex-nowrap">
              {tags.slice(0, 7).map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source} />)}
            </div>
            <AnidbDescription text={series?.AniDB?.Description} />
          </div>
        </div>
        <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${series.Images.Posters[0].Source}/Poster/${series.Images.Posters[0].ID}`} className="h-[23.875rem] w-[17.0625rem] rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
      </div>
      <div className="gap-x-8 flex flex-nowrap bg-background-alt/50 border border-background-border rounded-md p-8 font-semibold">
        <SeriesTab to="overview" icon={mdiInformationOutline} text="Overview" />
        <SeriesTab to="episodes" icon={mdiFilmstrip} text="Episodes" />
        <SeriesTab to="credits" icon={mdiAccountGroupOutline} text="Credits" />
        <SeriesTab to="images" icon={mdiImageMultipleOutline} text="Images" />
        <SeriesTab to="tags" icon={mdiTagTextOutline} text="Tags" />
        <SeriesTab to="files" icon={mdiFileDocumentMultipleOutline} text="Files" />
        <SeriesTab to="edit" icon={mdiPencilCircleOutline} text="Edit" />
      </div>
      <Outlet context={{ scrollRef }} />
      <div className="h-full w-full top-0 left-0 fixed opacity-5 -z-10" style={{ background: fanartUri !== '' ? `center / cover no-repeat url('${fanartUri}')` : undefined }} />
    </div>
  );
};

export default Series;
