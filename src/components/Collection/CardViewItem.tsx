import { CollectionGroupType } from '@/core/types/api/collection';
import { WebuiGroupExtra } from '@/core/types/api/webui';
import { ImageType } from '@/core/types/api/common';
import cx from 'classnames';
import { forEach, get } from 'lodash';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
  mdiAlertCircleOutline,
  mdiCalendarMonthOutline,
  mdiEyeCheckOutline,
  mdiTagTextOutline,
  mdiTelevisionAmbientLight,
  mdiTelevision,
  mdiFileDocumentMultipleOutline,
  mdiPencilCircleOutline,
} from '@mdi/js';
import moment from 'moment/moment';
import React from 'react';
import { SeriesSizesFileSourcesType } from '@/core/types/api/series';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import AnidbDescription from './AnidbDescription';

const renderFileSources = (sources: SeriesSizesFileSourcesType): string => {
  const output: Array<string> = [];
  forEach(sources, (source, type) => {
    if (source !== 0) { output.push(type); }
  });
  return output.join(' / ');
};

const SeriesTag = ({ text, type }) => (
  <div className={cx('text-xs font-semibold flex gap-x-2 items-center border-2 border-panel-border-alt rounded-md p-2 whitespace-nowrap capitalize', type === 'User' ? 'text-panel-important' : 'text-panel-primary')}>
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-panel-text">{text}</span>
  </div>
);

const CardViewItem = (item: CollectionGroupType, mainSeries?: WebuiGroupExtra) => {
  const poster: ImageType = get(item, 'Images.Posters.0');
  const missingEpisodesCount = item.Sizes.Total.Episodes + item.Sizes.Total.Specials - item.Sizes.Local.Episodes - item.Sizes.Local.Specials;

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
    <div key={`group-${item.IDs.ID}`} className="content-center flex flex-col p-8 gap-y-4 rounded-md bg-panel-background w-[56.6875rem] h-full grow border-overlay-border border shrink-0 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
      <div className="flex gap-x-4">
        <Link to={viewRouteLink()}>
          <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${poster.Source}/Poster/${poster.ID}`} className="group h-[12.5625rem] w-[8.625rem] shrink-0 rounded-md drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative" hidePlaceholderOnHover zoomOnHover>
            <div className="pointer-events-none opacity-0 flex bg-overlay-background h-full p-3 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
              <Link to="#" className="h-fit">
                <Icon path={mdiPencilCircleOutline} size="2rem" className="text-overlay-icon hover:text-overlay-icon-hover" />
              </Link>
            </div>
          </BackgroundImagePlaceholderDiv>
        </Link>
        <div className="flex flex-col gap-y-4">

          <div className="font-semibold" title={item.Name}>{item.Name}</div>

          <div className="flex flex-col gap-y-3">
            <div className="gap-x-4 flex flex-nowrap">
              <div className="gap-x-2 flex align-middle items-center">
                <Icon path={mdiTelevision} size={1} />
                <span className="text-sm font-semibold">{renderFileSources(item.Sizes.FileSources)}</span>
              </div>
              <div className="gap-x-2 flex align-middle items-center">
                <Icon path={mdiCalendarMonthOutline} size={1} />
                <span className="text-sm font-semibold">
                  {moment(mainSeries?.AirDate).format('MMMM Do, YYYY')} - {!mainSeries?.EndDate ? 'Current' : moment(mainSeries?.EndDate).format('MMMM Do, YYYY')}
                </span>
              </div>
              {isSeriesOngoing() && (
                <div className="gap-x-2 flex align-middle items-center">
                  <Icon path={mdiTelevisionAmbientLight} size={1} />
                  <span className="text-sm font-semibold">Ongoing Series</span>
                </div>
              )}
            </div>

            <div className="gap-x-4 flex flex-nowrap">
              <div className="gap-x-2 flex align-middle items-center">
                <Icon path={mdiFileDocumentMultipleOutline} size={1} />
                <span className="text-sm font-semibold">Episodes {item.Sizes.Local.Episodes} / {item.Sizes.Total.Episodes} | Specials {item.Sizes.Local.Specials} / {item.Sizes.Total.Specials}</span>
              </div>
              <div className="gap-x-2 flex align-middle items-center">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span className="text-sm font-semibold">Episodes {item.Sizes.Watched.Episodes}  / {item.Sizes.Total.Episodes} | Specials {item.Sizes.Watched.Specials} / {item.Sizes.Total.Specials} </span>
              </div>
              <div className={cx('gap-x-2 flex align-middle items-center', missingEpisodesCount === 0 && 'hidden')}>
                <Icon className="text-panel-warning" path={mdiAlertCircleOutline} size={1} />
                <span className="text-sm font-semibold">{item.Sizes.Total.Episodes - item.Sizes.Local.Episodes} ({item.Sizes.Total.Specials - item.Sizes.Local.Specials})</span>
              </div>
            </div>
          </div>

          <div className="text-sm line-clamp-4"><AnidbDescription text={item.Description} /></div>
        </div>
      </div>
      <div className="flex items-start flex-wrap h-9 gap-x-2 overflow-hidden">
        {mainSeries?.Tags.slice(0, 10).map(tag => <SeriesTag key={`${mainSeries.ID}-${tag.Name}`} text={tag.Name} type={tag.Source} />) ?? ''}
      </div>
    </div>
  );
};

export default CardViewItem;
