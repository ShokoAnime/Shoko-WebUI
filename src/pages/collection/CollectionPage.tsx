import React, { useEffect, useState } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';
import { get, memoize, forEach } from 'lodash';
import { Link } from 'react-router-dom';
import {
  mdiFormatListText,
  mdiCogOutline,
  mdiLoading,
  mdiCalendarMonthOutline,
  mdiLayersTripleOutline,
  mdiEyeCheckOutline,
  mdiAlertBoxOutline,
  mdiEyeArrowRightOutline,
  mdiSquareEditOutline, mdiDisc,
} from '@mdi/js';
import { Icon } from '@mdi/react';

import Events from '../../core/events';
import { setStatus } from '../../core/slices/modals/filters';
import ShokoPanel from '../../components/Panels/ShokoPanel';

import { RootState } from '../../core/store';
import type { CollectionGroupType } from '../../core/types/api/collection';
import type { ImageType } from '../../core/types/api/common';
import type { SeriesSizesFileSourcesType } from '../../core/types/api/series';

const HoverIcon = ({ icon, label, route }) => (
  <Link to={route}>
    <div className="flex flex-col justify-items-center items-center my-2">
      <div className="bg-background-border rounded-full inline-block shrink p-4 text-highlight-1 mb-2">
        <Icon path={icon} size={1} />
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  </Link>
);


function CollectionPage() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 344; //328 + 16
  const itemHeightList = 224; //176 + 16
  const pageSize = 50;
  const fetchedPages = useSelector((state: RootState) => state.collection.fetchedPages);
  const total: number = useSelector((state: RootState) => state.collection.total);
  const dispatch = useDispatch();
  const [mode, setMode] = useState('grid');
  
  const toggleMode = () => { setMode(mode === 'list' ? 'grid' : 'list'); };
  
  useEffect(() => {
    dispatch({ type: Events.COLLECTION_PAGE_LOAD });
  }, []);
  
  const showFilters = () => {
    dispatch(setStatus(true));
  };

  const renderTitle = count => (
    <React.Fragment>
      Entire Collection
      <span className="px-2">|</span>
      <span className="text-highlight-2">{count} Items</span>
    </React.Fragment>
  );
  const renderOptions = () => (
    <div className="flex" title="Settings">
      <span className="px-2 cursor-pointer" title="View" onClick={toggleMode}><Icon path={mdiFormatListText} size={1} horizontal vertical rotate={180}/></span>
      <span className="px-2 cursor-pointer" title="Settings" onClick={showFilters}><Icon path={mdiCogOutline} size={1} horizontal vertical rotate={180}/></span>
    </div>
  );
  
  const renderDetails = (item: CollectionGroupType) => {
    const posters = item.Images.Posters.filter(p => p.Source === 'AniDB');
    
    return (
      <div key={`group-${item.IDs.ID}`} className="group mr-4 last:mr-0 shrink-0 w-56 font-open-sans content-center flex flex-col">
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/AniDB/Poster/${posters[0].ID}')` }} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2">
          <div className="hidden group-hover:flex bg-background-nav/85 h-full flex-col justify-center items-center">
            <HoverIcon icon={mdiEyeArrowRightOutline} label="View Group" route={`group/${item.IDs.ID}`} />
            <HoverIcon icon={mdiSquareEditOutline} label="Edit Group" route="" />
          </div>
        </div>
        <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
      </div>
    );
  };
  
  const renderFileSources = (sources: SeriesSizesFileSourcesType):string => {
    const output: Array<string> = [];
    forEach(sources, (source, type) => {
      if (source !== 0) { output.push(type); }
    });
    return output.join(' / ');
  };
  
  const renderList = (item: CollectionGroupType) => {
    const poster: ImageType = get(item, 'Images.Posters.0');
    
    return (
      <div key={`group-${item.IDs.ID}`} className="mb-4 font-open-sans content-center flex">
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/${poster.Source}/Poster/${poster.ID}')` }} className="h-48 w-32 shrink-0 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
        <div className="flex flex-col pl-4 justify-between py-2">
          <p className="text-base font-semibold" title={item.Name}>{item.Name}</p>
          <div className="space-x-4 flex flex-nowrap">
            <div className="space-x-2 flex">
              <Icon path={mdiCalendarMonthOutline} size={1} />
              <span>??</span>
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
          <div>tags</div>
        </div>
      </div>
    );
  };
  
  const renderPlaceholder = () => (<div className="mr-4 last:mr-0 shrink-0 h-72 w-56 font-open-sans items-center justify-center flex flex-col border border-black">
    <Icon path={mdiLoading} spin size={1} />
  </div>);
  
  const fetchPage = memoize((page) => { dispatch({ type: Events.COLLECTION_GET_GROUPS, payload: page }); return true; });

  const Cell = columns => ({ columnIndex, key, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    const neededPage = Math.ceil((index + 1) / pageSize);
    const groupList = fetchedPages[neededPage];
    if (groupList == undefined) {
      fetchPage(neededPage);
      return (
        <div key={key} style={style}>
          {renderPlaceholder()}
        </div>
      );
    }
    const item = groupList[index % pageSize];
    return (
    <div key={key} style={style}>
      {mode === 'grid' ? renderDetails(item) : renderList(item)}
    </div>
    );
  };
  
  return (
    <div className="p-9 pr-0 h-full min-w-full">
      <ShokoPanel title={renderTitle(total)} options={renderOptions()}>
        <AutoSizer>
          {({ width, height }) => {
            const columns = Math.floor(width / itemWidth);
            const rows = mode === 'grid' ? total / columns : total;
            return (
              <Grid overscanRowCount={1} columnCount={mode === 'grid' ? columns : 1} rowCount={rows} columnWidth={mode === 'grid' ? itemWidth : width - 32} height={height} rowHeight={mode === 'grid' ? itemHeight : itemHeightList} width={width} cellRenderer={Cell(columns)} />
            );
          }}
        </AutoSizer>
      </ShokoPanel>
    </div>
  );
}

export default CollectionPage;