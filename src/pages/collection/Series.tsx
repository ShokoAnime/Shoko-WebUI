import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router';
import { Link, NavLink, useOutletContext } from 'react-router-dom';
import {
  mdiAccountGroupOutline,
  mdiCalendarMonthOutline,
  mdiChevronRight,
  mdiEyeOutline,
  mdiFileDocumentMultipleOutline,
  mdiFilmstrip,
  mdiImageMultipleOutline,
  mdiInformationOutline,
  mdiPencilCircleOutline,
  mdiTagTextOutline,
  mdiTelevision,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import dayjs from 'dayjs';
import { get, isArray, random } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import AnidbDescription from '@/components/Collection/AnidbDescription';
import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import { useGetGroupQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';
import { useGetSeriesQuery, useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import useMainPoster from '@/hooks/useMainPoster';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesDetailsType } from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

const IconNotification = ({ text }) => (
  <div className="flex items-center gap-x-2 font-semibold">
    <Icon path={mdiInformationOutline} size={1} className="text-panel-text-important" />
    <div className="flex flex-col">
      {text}
    </div>
  </div>
);

const SeriesTab = ({ icon, text, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cx(
        'flex items-center gap-x-2',
        isActive && 'text-panel-text-primary',
      )}
  >
    <Icon className="text-panel-icon" path={icon} size={1} />
    {text}
  </NavLink>
);

const SeriesTag = ({ text, type }) => (
  <div
    className={cx(
      'text-xs font-semibold flex gap-x-2 items-center border-2 border-panel-tags rounded-md p-2 whitespace-nowrap capitalize',
      type === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action',
    )}
  >
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

const Series = () => {
  const { seriesId } = useParams();
  const [fanartUri, setFanartUri] = useState('');
  const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);

  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();

  const seriesData = useGetSeriesQuery({ seriesId: seriesId!, includeDataFrom: ['AniDB'] }, { skip: !seriesId });
  const series = useMemo(() => seriesData?.data ?? {} as SeriesDetailsType, [seriesData]);
  const mainPoster = useMainPoster(series);
  const tagsData = useGetSeriesTagsQuery({ seriesId: seriesId!, excludeDescriptions: true }, { skip: !seriesId });
  const tags: TagType[] = tagsData?.data ?? [] as TagType[];
  const groupData = useGetGroupQuery({ groupId: series.IDs?.ParentGroup.toString() }, {
    skip: !series.IDs?.ParentGroup,
  });
  const group = groupData?.data ?? {} as CollectionGroupType;

  useEffect(() => {
    const fanarts = get(series, 'Images.Fanarts', []);
    if (!isArray(fanarts) || fanarts.length === 0) return;
    const randomIdx = fanarts.length > 1 ? random(0, fanarts.length) : 0;
    const randomImage = fanarts[randomIdx];
    setFanartUri(`/api/v3/Image/${randomImage.Source}/${randomImage.Type}/${randomImage.ID}`);
  }, [series]);

  const [airDate, endDate, isSeriesOngoing] = useMemo(() => {
    const tempAirDate = dayjs(series.AniDB?.AirDate);
    const tempEndDate = dayjs(series.AniDB?.EndDate);
    return [tempAirDate, tempEndDate, series.AniDB?.EndDate ? tempEndDate.isAfter(dayjs()) : true];
  }, [series]);

  if (!seriesId || !seriesData.isSuccess) return null;

  return (
    <>
      <div className="flex flex-col gap-y-8">
        <div className="flex w-full gap-x-8 rounded-md border border-panel-border bg-panel-background-transparent p-8">
          <div className="flex grow flex-col gap-y-2">
            <div className="flex justify-between">
              <div className="flex gap-x-2">
                <Link className="font-semibold text-panel-text-primary" to="/webui/collection">Entire Collection</Link>
                <Icon path={mdiChevronRight} size={1} />
                {group.Size > 1 && (
                  <>
                    <Link
                      className="font-semibold text-panel-text-primary"
                      to={`/webui/collection/group/${series.IDs.ParentGroup}`}
                    >
                      {group.Name}
                    </Link>
                    <Icon path={mdiChevronRight} size={1} />
                  </>
                )}
              </div>
              <div className="flex gap-x-3">
                {isSeriesOngoing && <IconNotification text="Series is Ongoing" />}
                {/* TODO: Check whether new files are added */}
                {/* <IconNotification text="New Files Added Recently" /> */}
              </div>
            </div>
            <div className="flex max-w-[56.25rem] flex-col gap-y-4">
              <div className="text-4xl font-semibold">{series.Name}</div>
              <div className="text-xl font-semibold opacity-65">
                {series.AniDB?.Titles.find(title => title.Type === 'Main')?.Name}
              </div>
              <div className="flex flex-nowrap gap-x-4 text-sm">
                <div className="flex items-center gap-x-2">
                  <Icon className="text-panel-icon" path={mdiTelevision} size={1} />
                  <span>{series?.AniDB?.Type}</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <Icon className="text-panel-icon" path={mdiCalendarMonthOutline} size={1} />
                  <span>
                    {airDate.format('MMMM Do, YYYY')}
                    {!airDate.isSame(endDate) && (
                      <>
                        &nbsp;-&nbsp;
                        {endDate.toString() === 'Invalid Date' ? 'Current' : endDate.format('MMMM Do, YYYY')}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <Icon className="text-panel-icon" path={mdiFileDocumentMultipleOutline} size={1} />
                  {`${series?.Sizes.Local.Episodes} / ${series?.Sizes.Total.Episodes} | ${series?.Sizes.Local.Specials} / ${series?.Sizes.Total.Specials}`}
                </div>
                <div className="flex items-center gap-x-2">
                  <Icon className="text-panel-icon" path={mdiEyeOutline} size={1} />
                  {`${series?.Sizes.Watched.Episodes} / ${series?.Sizes.Total.Episodes} | ${series?.Sizes.Watched.Specials} / ${series?.Sizes.Total.Specials}`}
                </div>
              </div>
              <div className="flex flex-nowrap gap-x-4">
                {tags.slice(0, 7).map(tag => <SeriesTag key={tag.ID} text={tag.Name} type={tag.Source} />)}
              </div>
              <AnidbDescription text={series?.AniDB?.Description ?? ''} />
            </div>
          </div>
          <BackgroundImagePlaceholderDiv
            image={mainPoster}
            className="h-[23.875rem] w-[17.0625rem] rounded drop-shadow-md"
          />
        </div>
        <div className="flex flex-nowrap gap-x-8 rounded-md border border-panel-border bg-panel-background-transparent p-8 font-semibold">
          <SeriesTab to="overview" icon={mdiInformationOutline} text="Overview" />
          <SeriesTab to="episodes" icon={mdiFilmstrip} text="Episodes" />
          <SeriesTab to="credits" icon={mdiAccountGroupOutline} text="Credits" />
          <SeriesTab to="images" icon={mdiImageMultipleOutline} text="Images" />
          <SeriesTab to="tags" icon={mdiTagTextOutline} text="Tags" />
          <SeriesTab to="files" icon={mdiFileDocumentMultipleOutline} text="Files" />
          <div
            className="ml-auto flex cursor-pointer items-center gap-x-2"
            onClick={() => setShowEditSeriesModal(true)}
          >
            <Icon className="text-panel-icon" path={mdiPencilCircleOutline} size={1} />
            &nbsp;Edit
          </div>
        </div>
        <Outlet context={{ scrollRef }} />
        <div
          className="fixed left-0 top-0 -z-10 h-full w-full opacity-5"
          style={{ background: fanartUri !== '' ? `center / cover no-repeat url('${fanartUri}')` : undefined }}
        />
      </div>
      <EditSeriesModal
        show={showEditSeriesModal}
        onClose={() => setShowEditSeriesModal(false)}
        seriesId={series.IDs.ID}
      />
    </>
  );
};

export default Series;
