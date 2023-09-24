import React from 'react';
import { Link } from 'react-router-dom';
import {
  mdiAlertCircleOutline,
  mdiCalendarMonthOutline,
  mdiEyeCheckOutline,
  mdiFileDocumentMultipleOutline,
  mdiPencilCircleOutline,
  mdiTagTextOutline,
  mdiTelevision,
  mdiTelevisionAmbientLight,
} from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { forEach } from 'lodash';
import moment from 'moment/moment';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import useMainPoster from '@/hooks/useMainPoster';

import AnidbDescription from './AnidbDescription';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesSizesFileSourcesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

const renderFileSources = (sources: SeriesSizesFileSourcesType): string => {
  const output: string[] = [];
  forEach(sources, (source, type) => {
    if (source !== 0) output.push(type);
  });
  return output.join(' / ');
};

const SeriesTag = ({ text, type }) => (
  <div
    className={cx(
      'text-xs font-semibold flex gap-x-2 items-center border-2 border-panel-border-alt rounded-md p-2 whitespace-nowrap capitalize',
      type === 'User' ? 'text-panel-important' : 'text-panel-primary',
    )}
  >
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

const CardViewItem = ({ item, mainSeries }: { item: CollectionGroupType, mainSeries?: WebuiGroupExtra }) => {
  const poster = useMainPoster(item);
  const missingEpisodesCount = item.Sizes.Total.Episodes + item.Sizes.Total.Specials - item.Sizes.Local.Episodes
    - item.Sizes.Local.Specials;

  const viewRouteLink = () => {
    let link = '/webui/collection/';

    if (item.Size === 1) {
      link += `series/${item.IDs.MainSeries}`;
    } else {
      link += `group/${item.IDs.ID}`;
    }

    return link;
  };

  const isSeriesOngoing = () => {
    if (!mainSeries?.EndDate) return true;
    return moment(mainSeries.EndDate) > moment();
  };

  return (
    <div className="flex h-full w-[56.6875rem] shrink-0 grow flex-col content-center gap-y-4 rounded-md border border-overlay-border bg-panel-background p-8">
      <div className="flex gap-x-4">
        <Link to={viewRouteLink()}>
          <BackgroundImagePlaceholderDiv
            image={poster}
            className="group h-[12.5625rem] w-[8.625rem] shrink-0 rounded-md drop-shadow-md"
            hidePlaceholderOnHover
            zoomOnHover
          >
            <div className="pointer-events-none z-10 flex h-full bg-overlay-background p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <Link to="#" className="h-fit">
                <Icon
                  path={mdiPencilCircleOutline}
                  size="2rem"
                  className="text-overlay-icon hover:text-overlay-icon-hover"
                />
              </Link>
            </div>
          </BackgroundImagePlaceholderDiv>
        </Link>
        <div className="flex flex-col gap-y-4">
          <div className="font-semibold" title={item.Name}>{item.Name}</div>

          <div className="flex flex-col gap-y-3">
            <div className="flex flex-nowrap gap-x-4">
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiTelevision} size={1} />
                <span className="text-sm font-semibold">{renderFileSources(item.Sizes.FileSources)}</span>
              </div>
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiCalendarMonthOutline} size={1} />
                <span className="text-sm font-semibold">
                  {moment(mainSeries?.AirDate).format('MMMM Do, YYYY')}
                  &nbsp;-&nbsp;
                  {!mainSeries?.EndDate ? 'Current' : moment(mainSeries?.EndDate).format('MMMM Do, YYYY')}
                </span>
              </div>
              {isSeriesOngoing() && (
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
                  Episodes&nbsp;
                  {item.Sizes.Local.Episodes}
                  &nbsp;/&nbsp;
                  {item.Sizes.Total.Episodes}
                  &nbsp;| Specials&nbsp;
                  {item.Sizes.Local.Specials}
                  &nbsp;/&nbsp;
                  {item.Sizes.Total.Specials}
                </span>
              </div>
              <div className="flex items-center gap-x-2 align-middle">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span className="text-sm font-semibold">
                  Episodes&nbsp;
                  {item.Sizes.Watched.Episodes}
                  &nbsp;/&nbsp;
                  {item.Sizes.Total.Episodes}
                  &nbsp;| Specials&nbsp;
                  {item.Sizes.Watched.Specials}
                  &nbsp;/&nbsp;
                  {item.Sizes.Total.Specials}
                </span>
              </div>
              <div className={cx('gap-x-2 flex align-middle items-center', missingEpisodesCount === 0 && 'hidden')}>
                <Icon className="text-panel-warning" path={mdiAlertCircleOutline} size={1} />
                <span className="text-sm font-semibold">
                  {item.Sizes.Total.Episodes - item.Sizes.Local.Episodes}
                  &nbsp;(
                  {item.Sizes.Total.Specials - item.Sizes.Local.Specials}
                  )
                </span>
              </div>
            </div>
          </div>

          <div className="line-clamp-4 text-sm">
            <AnidbDescription text={item.Description ?? ''} />
          </div>
        </div>
      </div>
      <div className="flex h-9 flex-wrap items-start gap-x-2 overflow-hidden">
        {mainSeries?.Tags.slice(0, 10).map(tag => (
          <SeriesTag key={`${mainSeries.ID}-${tag.Name}`} text={tag.Name} type={tag.Source} />
        )) ?? ''}
      </div>
    </div>
  );
};

export default CardViewItem;
