import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  mdiAlertCircleOutline,
  mdiCalendarMonthOutline,
  mdiEyeOutline,
  mdiFileDocumentMultipleOutline,
  mdiPencilCircleOutline,
  mdiTagTextOutline,
  mdiTelevision,
  mdiTelevisionAmbientLight,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { forEach, reduce } from 'lodash';
import moment from 'moment/moment';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { listItemSize } from '@/components/Collection/CollectionView';
import { useGetSeriesTagsQuery } from '@/core/rtkQuery/splitV3Api/seriesApi';
import { useGetSettingsQuery } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { formatThousand } from '@/core/util';
import useMainPoster from '@/hooks/useMainPoster';
import { initialSettings } from '@/pages/settings/SettingsPage';

import AnidbDescription from './AnidbDescription';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesSizesFileSourcesType, SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

const renderFileSources = (sources: SeriesSizesFileSourcesType): string => {
  const output: string[] = [];
  forEach(sources, (source, type) => {
    if (source !== 0) output.push(type);
  });
  return output.join(' | ');
};

const SeriesTag = ({ text, type }: { text: string, type: 'AniDB' | 'User' }) => (
  <div
    className={cx(
      'text-xs font-semibold flex gap-x-2 items-center border-2 border-panel-tags rounded-md p-2 whitespace-nowrap capitalize',
      type === 'User' ? 'text-panel-text-important' : 'text-panel-text-primary',
    )}
  >
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

type Props = {
  item: CollectionGroupType | SeriesType;
  isSeries?: boolean;
  mainSeries?: WebuiGroupExtra;
  isSidebarOpen: boolean;
};

const ListViewItem = ({ isSeries, isSidebarOpen, item, mainSeries }: Props) => {
  const settingsQuery = useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: false });
  const settings = useMemo(() => settingsQuery?.data ?? initialSettings, [settingsQuery]);
  const { showCustomTags, showGroupIndicator, showItemType, showTopTags } = settings.WebUI_Settings.collection.list;

  const seriesTags = useGetSeriesTagsQuery({
    seriesId: item.IDs.ID.toString(),
    filter: 128,
    excludeDescriptions: true,
  }, { skip: !isSeries });

  const poster = useMainPoster(item);
  const missingEpisodesCount = item.Sizes.Total.Episodes + item.Sizes.Total.Specials - item.Sizes.Local.Episodes
    - item.Sizes.Local.Specials;

  const [airDate, description, endDate, groupCount] = useMemo(() => {
    if (isSeries) {
      const series = (item as SeriesType).AniDB;
      return [series?.AirDate, series?.Description, series?.EndDate, 0];
    }

    const group = item as CollectionGroupType;
    const tempCount = reduce(group.Sizes.SeriesTypes, (count, value) => count + value, 0);
    return [mainSeries?.AirDate, group.Description, mainSeries?.EndDate, tempCount];
  }, [isSeries, item, mainSeries?.AirDate, mainSeries?.EndDate]);

  const viewRouteLink = () => {
    let link = '/webui/collection/';

    if (isSeries) {
      link += `series/${item.IDs.ID}`;
    } else if (item.Size === 1) {
      link += `series/${(item as CollectionGroupType).IDs.MainSeries}`;
    } else {
      link += `group/${item.IDs.ID}`;
    }

    return link;
  };

  const isSeriesOngoing = useMemo(() => {
    if (!endDate) return true;
    return moment(endDate) > moment();
  }, [endDate]);

  const tags = useMemo(
    () => {
      let tempTags = (isSeries ? seriesTags?.data : mainSeries?.Tags) ?? [];
      if (!showTopTags) tempTags = tempTags.filter(tag => tag.Source !== 'AniDB');
      if (!showCustomTags) tempTags = tempTags.filter(tag => tag.Source !== 'User');
      tempTags = tempTags.toSorted((tagA, tagB) => tagB.Source.localeCompare(tagA.Source));
      return tempTags.slice(0, 10);
    },
    [isSeries, mainSeries?.Tags, seriesTags, showCustomTags, showTopTags],
  );

  return (
    <div
      className="flex h-full shrink-0 grow flex-col content-center gap-y-4 rounded-md border border-panel-border bg-panel-background p-8"
      style={{
        width: `${((isSeries || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width) / 16}rem`,
      }}
    >
      <div className="flex gap-x-4">
        <Link to={viewRouteLink()}>
          <BackgroundImagePlaceholderDiv
            image={poster}
            className="group h-[12.5625rem] w-[8.625rem] shrink-0 rounded-md drop-shadow-md"
            hidePlaceholderOnHover
            zoomOnHover
          >
            <div className="pointer-events-none z-10 flex h-full bg-panel-background-transparent p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <Link to="#" className="h-fit">
                <Icon
                  path={mdiPencilCircleOutline}
                  size="2rem"
                  className="text-panel-icon"
                />
              </Link>
            </div>
            {showGroupIndicator && groupCount > 1 && (
              <div className="absolute bottom-0 left-0 flex w-full justify-center rounded-bl-md bg-panel-background-overlay py-1.5 text-sm font-semibold opacity-100 transition-opacity group-hover:opacity-0">
                {groupCount}
                &nbsp;Series
              </div>
            )}
          </BackgroundImagePlaceholderDiv>
        </Link>
        <div className="flex flex-col gap-y-4">
          <div className="font-semibold" title={item.Name}>{item.Name}</div>

          <div className="flex flex-col gap-y-3">
            <div className="flex flex-nowrap gap-x-4">
              {showItemType && (
                <div className="flex items-center gap-x-2 align-middle">
                  <Icon path={mdiTelevision} size={1} />
                  <span className="text-sm font-semibold">{renderFileSources(item.Sizes.FileSources)}</span>
                </div>
              )}
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiCalendarMonthOutline} size={1} />
                <span className="text-sm font-semibold">
                  {moment(airDate).format('MMMM Do, YYYY')}
                  {airDate !== endDate && (
                    <>
                      &nbsp;-&nbsp;
                      {!endDate ? 'Current' : moment(endDate).format('MMMM Do, YYYY')}
                    </>
                  )}
                </span>
              </div>
              {isSeriesOngoing && (
                <div className="flex items-center gap-x-2 align-middle">
                  <Icon path={mdiTelevisionAmbientLight} size={1} />
                  <span className="text-sm font-semibold">Ongoing Series</span>
                </div>
              )}
            </div>

            <div className="flex flex-nowrap gap-x-4">
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiFileDocumentMultipleOutline} size={1} />
                <span className="text-sm font-semibold">
                  EP:&nbsp;
                  {formatThousand(item.Sizes.Local.Episodes)}
                  &nbsp;/&nbsp;
                  {formatThousand(item.Sizes.Total.Episodes)}
                  &nbsp;| SP:&nbsp;
                  {formatThousand(item.Sizes.Local.Specials)}
                  &nbsp;/&nbsp;
                  {formatThousand(item.Sizes.Total.Specials)}
                </span>
              </div>
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiEyeOutline} size={1} />
                <span className="text-sm font-semibold">
                  EP:&nbsp;
                  {formatThousand(item.Sizes.Watched.Episodes)}
                  &nbsp;/&nbsp;
                  {formatThousand(item.Sizes.Total.Episodes)}
                  &nbsp;| SP:&nbsp;
                  {formatThousand(item.Sizes.Watched.Specials)}
                  &nbsp;/&nbsp;
                  {formatThousand(item.Sizes.Total.Specials)}
                </span>
              </div>
              <div className={cx('gap-x-2 flex align-middle items-center', missingEpisodesCount === 0 && 'hidden')}>
                <Icon className="text-panel-text-warning" path={mdiAlertCircleOutline} size={1} />
                <span className="text-sm font-semibold">
                  {formatThousand(item.Sizes.Total.Episodes - item.Sizes.Local.Episodes)}
                  &nbsp;(
                  {formatThousand(item.Sizes.Total.Specials - item.Sizes.Local.Specials)}
                  )
                </span>
              </div>
            </div>
          </div>

          <div className="line-clamp-4 text-sm">
            <AnidbDescription text={description ?? ''} />
          </div>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex h-9 flex-wrap items-start gap-x-2 overflow-hidden">
          {tags.map(tag => <SeriesTag key={`${mainSeries?.ID}-${tag.Name}`} text={tag.Name} type={tag.Source} />) ?? ''}
        </div>
      )}
    </div>
  );
};

export default ListViewItem;
