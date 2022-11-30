import { CollectionGroupType } from '../../../core/types/api/collection';
import { WebuiGroupExtra } from '../../../core/types/api/webui';
import { ImageType } from '../../../core/types/api/common';
import { forEach, get } from 'lodash';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
  mdiAlertBoxOutline,
  mdiCalendarMonthOutline, mdiDisc,
  mdiEyeCheckOutline,
  mdiLayersTripleOutline,
} from '@mdi/js';
import React from 'react';
import { SeriesSizesFileSourcesType } from '../../../core/types/api/series';

const renderFileSources = (sources: SeriesSizesFileSourcesType):string => {
  const output: Array<string> = [];
  forEach(sources, (source, type) => {
    if (source !== 0) { output.push(type); }
  });
  return output.join(' / ');
};

const ListViewGroupItem = (item: CollectionGroupType, mainSeries?: WebuiGroupExtra) => {
  const poster: ImageType = get(item, 'Images.Posters.0');

  return (
    <div key={`group-${item.IDs.ID}`} className="mb-4 font-open-sans content-center flex">
      <Link to={`/webui/collection/group/${item.IDs.ID}`}>
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${poster.Source}/Poster/${poster.ID}')` }} className="h-48 w-32 shrink-0 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
      </Link>
      <div className="flex flex-col pl-4 justify-between py-2">
        <p className="text-base font-semibold" title={item.Name}>{item.Name}</p>
        <div className="space-x-4 flex flex-nowrap">
          <div className="space-x-2 flex">
            <Icon path={mdiCalendarMonthOutline} size={1} />
            <span>{mainSeries?.AirDate} - {mainSeries?.EndDate}</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiLayersTripleOutline} size={1} />
            <span>{item.Sizes.Local.Episodes} ({item.Sizes.Local.Specials})</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiEyeCheckOutline} size={1} />
            <span>{item.Sizes.Watched.Episodes} ({item.Sizes.Watched.Specials})</span>
          </div>
          <div className="space-x-2 flex">
            <Icon className="text-highlight-5" path={mdiAlertBoxOutline} size={1} />
            <span>{item.Sizes.Total.Episodes - item.Sizes.Local.Episodes} ({item.Sizes.Total.Specials - item.Sizes.Local.Specials})</span>
          </div>
          <div className="space-x-2 flex">
            <Icon path={mdiDisc} size={1} />
            <span>{renderFileSources(item.Sizes.FileSources)}</span>
          </div>
        </div>
        <div className="text-base font-semibold line-clamp-3">{item.Description}</div>
        <div className="flex items-start flex-wrap h-8 overflow-hidden">{mainSeries?.Tags.map(tag => <span key={`${mainSeries.ID}-${tag.Name}`} className="m-1 px-1 py-0.5 rounded-md text-font-main bg-background-alt text-sm border-highlight-2 border whitespace-nowrap">{tag.Name}</span>) ?? ''}</div>
      </div>
    </div>
  );
};

export default ListViewGroupItem;