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
} from '@mdi/js';
import React from 'react';
import { SeriesSizesFileSourcesType } from '@/core/types/api/series';
import AnidbDescription from './AnidbDescription';
import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';

const renderFileSources = (sources: SeriesSizesFileSourcesType): string => {
  const output: Array<string> = [];
  forEach(sources, (source, type) => {
    if (source !== 0) { output.push(type); }
  });
  return output.join(' / ');
};

const SeriesTag = ({ text, type }) => (
  <div className={cx('text-xs font-semibold flex space-x-2 items-center border-2 border-[rgba(63,71,98,1)] rounded-[10px] p-2 whitespace-nowrap capitalize', type === 'User' ? 'text-highlight-2' : 'text-highlight-1')}>
    <Icon path={mdiTagTextOutline} size="1rem" />
    <span className="text-font-main">{text}</span>
  </div>
);

const ListViewGroupItem = (item: CollectionGroupType, mainSeries?: WebuiGroupExtra) => {
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

  return (
    <div key={`group-${item.IDs.ID}`} className="content-center flex flex-col p-8 space-y-4 rounded bg-background-alt w-[56.875rem] border-background-border border">
      <div className="flex space-x-4">
        <Link to={viewRouteLink()}>
          <BackgroundImagePlaceholderDiv imageSrc={`/api/v3/Image/${poster.Source}/Poster/${poster.ID}`} className="h-[12.5625rem] w-[8.625rem] shrink-0 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black" />
        </Link>
        <div className="flex flex-col space-y-4">
          <p className="text-base font-semibold" title={item.Name}>{item.Name}</p>
          <div className="flex flex-col space-y-3">
            <div className="space-x-4 flex flex-nowrap">
              <div className="space-x-2 flex align-middle items-center">
                <Icon path={mdiTelevision} size={1} />
                <span className='text-sm font-semibold'>{renderFileSources(item.Sizes.FileSources)}</span>
              </div>
              <div className="space-x-2 flex align-middle items-center">
                <Icon path={mdiCalendarMonthOutline} size={1} />
                <span className='text-sm font-semibold'>{mainSeries?.AirDate} - {mainSeries?.EndDate === null ? 'Ongoing' : mainSeries?.EndDate}</span>
              </div>
              <div className={cx('space-x-2 flex align-middle items-center', mainSeries?.EndDate !== null && 'hidden')}>
                <Icon path={mdiTelevisionAmbientLight} size={1} />
                <span className='text-sm font-semibold'>Ongoing Series</span>
              </div>
            </div>
            <div className="space-x-4 flex flex-nowrap">
              <div className="space-x-2 flex align-middle items-center">
                <Icon path={mdiFileDocumentMultipleOutline} size={1} />
                <span className='text-sm font-semibold'>Episodes {item.Sizes.Local.Episodes} / {item.Sizes.Total.Episodes} | Specials {item.Sizes.Local.Specials} / {item.Sizes.Total.Specials}</span>
              </div>
              <div className="space-x-2 flex align-middle items-center">
                <Icon path={mdiEyeCheckOutline} size={1} />
                <span className='text-sm font-semibold'>Episodes {item.Sizes.Watched.Episodes}  / {item.Sizes.Total.Episodes} | Specials {item.Sizes.Watched.Specials} / {item.Sizes.Total.Specials} </span>
              </div>
              <div className={cx('space-x-2 flex align-middle items-center', missingEpisodesCount === 0 && 'hidden')}>
                <Icon className="text-highlight-4" path={mdiAlertCircleOutline} size={1} />
                <span className='text-sm font-semibold'>{item.Sizes.Total.Episodes - item.Sizes.Local.Episodes} ({item.Sizes.Total.Specials - item.Sizes.Local.Specials})</span>
              </div>
            </div>
          </div>
          <div className="text-sm line-clamp-4"><AnidbDescription text={item.Description} /></div>
        </div>
      </div>
      <div className="flex items-start flex-wrap h-9 space-x-2 overflow-hidden">
        {mainSeries?.Tags.map(tag => <SeriesTag key={`${mainSeries.ID}-${tag.Name}`} text={tag.Name} type={tag.Source} />) ?? ''}
      </div>
    </div>
  );
};

export default ListViewGroupItem;