import { CollectionGroupType } from '../../../core/types/api/collection';
import { WebuiGroupExtra } from '../../../core/types/api/webui';
import { ImageType } from '../../../core/types/api/common';
import cx from 'classnames';
import { forEach, get, reduce } from 'lodash';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
  mdiAlertBoxOutline,
  mdiCalendarMonthOutline, 
  mdiDisc,
  mdiEyeCheckOutline,
  mdiLayersTripleOutline,
  mdiGroup,
} from '@mdi/js';
import React from 'react';
import { SeriesSizesFileSourcesType } from '../../../core/types/api/series';
import AnidbDescription from './AnidbDescription';

const renderFileSources = (sources: SeriesSizesFileSourcesType):string => {
  const output: Array<string> = [];
  forEach(sources, (source, type) => {
    if (source !== 0) { output.push(type); }
  });
  return output.join(' / ');
};

const ListViewGroupItem = (item: CollectionGroupType, mainSeries?: WebuiGroupExtra) => {
  const poster: ImageType = get(item, 'Images.Posters.0');
  const types = reduce(item?.Sizes.SeriesTypes, (out, value, key) => {
    if (value === 0) { return out; }
    out.push(`${value} ${key}`);
    return out;
  }, [] as Array<string>);
  const missingEpisodesCount = item.Sizes.Total.Episodes + item.Sizes.Total.Specials - item.Sizes.Local.Episodes - item.Sizes.Local.Specials;
  
  return (
    <div key={`group-${item.IDs.ID}`} className="font-open-sans content-center flex">
      <Link to={`/webui/collection/group/${item.IDs.ID}`}>
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${poster.Source}/Poster/${poster.ID}')` }} className="h-48 w-32 shrink-0 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
      </Link>
      <div className="flex flex-col pl-4 justify-between py-2">
        <p className="text-base font-semibold" title={item.Name}>{item.Name}</p>
        <div className="space-x-4 flex flex-nowrap">
          <div className="space-x-2 flex">
            <Icon path={mdiCalendarMonthOutline} size={1} />
            <span>{mainSeries?.AirDate} - {mainSeries?.EndDate === null ? 'Ongoing' : mainSeries?.EndDate}</span>
          </div>
          <div className={cx('space-x-2 flex', types.length === 0 && 'hidden')}>
            <Icon path={mdiGroup} size={1} />
            <span>{types.join(' | ')}</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiLayersTripleOutline} size={1} />
            <span>{item.Sizes.Local.Episodes} ({item.Sizes.Local.Specials})</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiEyeCheckOutline} size={1} />
            <span>{item.Sizes.Watched.Episodes} ({item.Sizes.Watched.Specials})</span>
          </div>
          <div className={cx('space-x-2 flex', missingEpisodesCount === 0 && 'hidden')}>
            <Icon className="text-highlight-5" path={mdiAlertBoxOutline} size={1} />
            <span>{item.Sizes.Total.Episodes - item.Sizes.Local.Episodes} ({item.Sizes.Total.Specials - item.Sizes.Local.Specials})</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiDisc} size={1} />
            <span>{renderFileSources(item.Sizes.FileSources)}</span>
          </div>
        </div>
        <div className="text-base line-clamp-3"><AnidbDescription text={item.Description}/></div>
        <div className="flex items-start flex-wrap h-8 overflow-hidden">
          {mainSeries?.Tags.map(tag => <span key={`${mainSeries.ID}-${tag.Name}`} className={cx('m-1 px-1 py-0.5 rounded-md text-font-main bg-background-alt text-sm border whitespace-nowrap', tag.Source === 'AniDB' ? 'border-highlight-1' : 'border-highlight-2' )}>{tag.Name}</span>) ?? ''}
        </div>
      </div>
    </div>
  );
};

export default ListViewGroupItem;