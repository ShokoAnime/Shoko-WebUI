import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  mdiAlertCircleOutline,
  mdiCalendarMonthOutline,
  mdiEyeOutline,
  mdiFileDocumentMultipleOutline,
  mdiPencilCircleOutline,
  mdiTelevision,
  mdiTelevisionAmbientLight,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { reduce } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import TagButton from '@/components/Collection/TagButton';
import { listItemSize } from '@/components/Collection/constants';
import Button from '@/components/Input/Button';
import { useSeriesTagsQuery } from '@/core/react-query/series/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { dayjs, formatThousand } from '@/core/util';
import useEditGroupCallback from '@/hooks/collection/useEditGroupCallback';
import useEditSeriesCallback from '@/hooks/collection/useEditSeriesCallback';
import useRouteLink from '@/hooks/collection/useRouteLink';
import useMainPoster from '@/hooks/useMainPoster';

import CleanDescription from './CleanDescription';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesSizesFileSourcesType, SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

const typeMap = { Unknown: 'Unk', BluRay: 'BD' };
const isFileType = (type: string): type is keyof typeof typeMap => type in typeMap;
const renderFileSources = (sources: SeriesSizesFileSourcesType): string => {
  const output: string[] = [];

  Object.entries(sources).forEach(([type, source]) => {
    if (source !== 0) {
      output.push(isFileType(type) ? typeMap[type] : type);
    }
  });

  return output.join(' | ');
};

type Props = {
  item: CollectionGroupType | SeriesType;
  isSeries?: boolean;
  groupExtras?: WebuiGroupExtra;
  isSidebarOpen: boolean;
};

const ListViewItem = ({ groupExtras, isSeries = false, isSidebarOpen, item }: Props) => {
  const settings = useSettingsQuery().data;
  const { showCustomTags, showGroupIndicator, showItemType, showTopTags } = settings.WebUI_Settings.collection.list;

  const tagsQuery = useSeriesTagsQuery(item.IDs.ID, { filter: 1, excludeDescriptions: true }, isSeries);

  const poster = useMainPoster(item);
  const missingEpisodesCount = item.Sizes.Total.Episodes + item.Sizes.Total.Specials - item.Sizes.Local.Episodes
    - item.Sizes.Local.Specials;

  const [airDate, description, altDescription, endDate, groupCount, isSeriesOngoing] = useMemo(() => {
    if (isSeries) {
      const anidbSeries = (item as SeriesType).AniDB;
      const tmdbSeries = (item as SeriesType).TMDB;
      const tempEndDate = dayjs(anidbSeries?.EndDate);
      return [
        dayjs(anidbSeries?.AirDate),
        item.Description,
        tmdbSeries?.Shows[0]?.Overview ?? tmdbSeries?.Movies[0]?.Overview ?? '',
        tempEndDate,
        0,
        anidbSeries?.EndDate ? tempEndDate.isAfter(dayjs()) : true,
      ];
    }

    const group = item as CollectionGroupType;
    const tempCount = reduce(group.Sizes.SeriesTypes, (count, value) => count + value, 0);
    const tempEndDate = dayjs(groupExtras?.EndDate);
    return [
      dayjs(groupExtras?.AirDate),
      group.Description,
      undefined,
      tempEndDate,
      tempCount,
      groupExtras?.EndDate ? tempEndDate.isAfter(dayjs()) : true,
    ];
  }, [isSeries, item, groupExtras?.AirDate, groupExtras?.EndDate]);

  const tags = useMemo(
    () => {
      let tempTags = (isSeries ? tagsQuery?.data : groupExtras?.Tags) ?? [];
      if (!showTopTags) tempTags = tempTags.filter(tag => tag.Source !== 'AniDB');
      if (!showCustomTags) tempTags = tempTags.filter(tag => tag.Source !== 'User');
      tempTags = tempTags.toSorted((tagA, tagB) => tagB.Source.localeCompare(tagA.Source));
      return tempTags.slice(0, 10);
    },
    [isSeries, groupExtras?.Tags, tagsQuery.data, showCustomTags, showTopTags],
  );

  const routeLink = useRouteLink(item);
  const editSeriesModalCallback = useEditSeriesCallback(item);
  const editGroupModalCallback = useEditGroupCallback(item);

  return (
    <div
      className="flex h-full shrink-0 grow flex-col content-center gap-y-3 rounded-lg border border-panel-border bg-panel-background p-6"
      style={{
        width: `${((isSeries || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width) / 16}rem`,
      }}
    >
      <div className="flex gap-x-3">
        <Link to={routeLink}>
          <BackgroundImagePlaceholderDiv
            image={poster}
            className="group h-[13.438rem] w-[9.25rem] shrink-0 rounded-lg drop-shadow-md"
            hidePlaceholderOnHover
            zoomOnHover
          >
            <div className="pointer-events-none z-10 flex h-full bg-panel-background-poster-overlay p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <Button
                className="pointer-events-auto h-fit"
                onClick={(isSeries || item.Size === 1) ? editSeriesModalCallback : editGroupModalCallback}
                tooltip={(isSeries || item.Size === 1) ? 'Edit Series' : 'Edit Group'}
              >
                <Icon path={mdiPencilCircleOutline} size="2rem" />
              </Button>
            </div>
            {showGroupIndicator && groupCount > 1 && (
              <div className="absolute bottom-0 left-0 flex w-full justify-center rounded-bl-md bg-panel-background-overlay py-1.5 text-sm font-semibold opacity-100 transition-opacity group-hover:opacity-0">
                {groupCount}
                &nbsp;Series
              </div>
            )}
          </BackgroundImagePlaceholderDiv>
        </Link>
        <div className="flex flex-col gap-y-3">
          <div className="font-semibold">
            <Link
              to={routeLink}
              className="transition-colors hover:text-panel-text-primary"
              data-tooltip-id="tooltip"
              data-tooltip-content={item.Name}
            >
              {item.Name}
            </Link>
          </div>

          <div className="flex flex-col gap-y-3">
            <div className="flex flex-nowrap items-center gap-x-3">
              {showItemType && (
                <div className="flex items-center gap-x-2 align-middle">
                  <Icon path={mdiTelevision} size={1} />
                  <span className="text-sm font-semibold">{renderFileSources(item.Sizes.FileSources)}</span>
                </div>
              )}
              {(groupExtras ?? isSeries) && (
                <>
                  <div className="flex items-center gap-x-2 align-middle">
                    <Icon path={mdiCalendarMonthOutline} size={1} />
                    <span className="text-sm font-semibold">
                      {airDate.format('MMMM Do, YYYY')}
                      {!airDate.isSame(endDate) && (
                        <>
                          &nbsp;-&nbsp;
                          {endDate.toString() === 'Invalid Date' ? 'Current' : endDate.format('MMMM Do, YYYY')}
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
                </>
              )}
            </div>

            <div className="flex flex-nowrap items-center gap-x-3">
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiFileDocumentMultipleOutline} size={1} />
                <div className="flex gap-x-2 text-sm font-semibold ">
                  <div className="flex gap-x-1">
                    <span>EP:</span>
                    {formatThousand(item.Sizes.Local.Episodes)}
                    <span>/</span>
                    {formatThousand(item.Sizes.Total.Episodes)}
                  </div>
                  {item.Sizes.Total.Specials !== 0 && (
                    <>
                      <span>|</span>
                      <div className="flex gap-x-1">
                        <span>SP:</span>
                        {formatThousand(item.Sizes.Local.Specials)}
                        <span>/</span>
                        {formatThousand(item.Sizes.Total.Specials)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiEyeOutline} size={1} />
                <div className="flex gap-x-2 text-sm font-semibold">
                  <div className="flex gap-x-1">
                    <span>EP:</span>
                    {formatThousand(item.Sizes.Watched.Episodes)}
                    <span>/</span>
                    {formatThousand(item.Sizes.Local.Episodes)}
                  </div>
                  {item.Sizes.Total.Specials !== 0 && (
                    <>
                      <span>|</span>
                      <div className="flex gap-x-1">
                        <span>SP:</span>
                        {formatThousand(item.Sizes.Watched.Specials)}
                        <span>/</span>
                        {formatThousand(item.Sizes.Local.Specials)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={cx('gap-x-2 flex align-middle items-center', missingEpisodesCount === 0 && 'hidden')}>
                <Icon className="text-panel-text-warning" path={mdiAlertCircleOutline} size={1} />
                <div className="flex gap-x-2 text-sm font-semibold">
                  {item.Sizes.Total.Episodes - item.Sizes.Local.Episodes !== 0 && (
                    <>
                      <div className="flex gap-x-1">
                        <span>EP:</span>
                        {formatThousand(item.Sizes.Total.Episodes - item.Sizes.Local.Episodes)}
                      </div>
                      {item.Sizes.Total.Specials - item.Sizes.Local.Specials !== 0 && <span>|</span>}
                    </>
                  )}
                  <div className="flex gap-x-1">
                    <span>SP:</span>
                    {formatThousand(item.Sizes.Total.Specials - item.Sizes.Local.Specials)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="line-clamp-4 text-sm">
            <CleanDescription text={description ?? ''} altText={altDescription} />
          </div>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex h-9 flex-wrap items-start gap-x-2 overflow-hidden">
          {tags.map(tag => (
            <TagButton key={`${groupExtras?.ID}-${tag.Name}`} text={tag.Name} tagType={tag.Source} type="Collection" />
          ))
            ?? ''}
        </div>
      )}
    </div>
  );
};

export default ListViewItem;
