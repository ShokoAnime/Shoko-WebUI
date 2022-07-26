import React, { useEffect, useState } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';
import { get, memoize } from 'lodash';
import {
  mdiFormatListText,
  mdiCogOutline,
  mdiLoading,
  mdiCalendarMonthOutline,
  mdiLayersTripleOutline,
  mdiEyeCheckOutline,
  mdiAlertBoxOutline,
} from '@mdi/js';
import { Icon } from '@mdi/react';

import Events from '../../core/events';

import { RootState } from '../../core/store';
import { CollectionGroupType } from '../../core/types/api/collection';
import ShokoPanel from '../../components/Panels/ShokoPanel';
import { ImageType } from '../../core/types/api/common';


function CollectionPage() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 344; //328 + 16
  const itemHeightList = 224; //176 + 16
  const pageSize = 50;
  const items: Array<CollectionGroupType> = useSelector((state: RootState) => state.collection.groups);
  const fetchedPages: Array<number> = useSelector((state: RootState) => state.collection.fetchedPages);
  const total: number = useSelector((state: RootState) => state.collection.total);
  const dispatch = useDispatch();
  const [mode, setMode] = useState('grid');
  
  const toggleMode = () => { setMode(mode === 'list' ? 'grid' : 'list'); };
  
  useEffect(() => {
    dispatch({ type: Events.COLLECTION_PAGE_LOAD });
  }, []);

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
      <span className="px-2 cursor-pointer" title="Settings"><Icon path={mdiCogOutline} size={1} horizontal vertical rotate={180}/></span>
    </div>
  );
  
  const renderDetails = (item: CollectionGroupType) => {
    const posters = item.Images.Posters.filter(p => p.Source === 'AniDB');
    
    return (
      <div key={`group-${item.IDs.ID}`} className="mr-4 last:mr-0 shrink-0 w-56 font-open-sans content-center flex flex-col">
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/AniDB/Poster/${posters[0].ID}')` }} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
        <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
      </div>
    );
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
              <Icon className="color-highlight-5" path={mdiAlertBoxOutline} size={1} />
              <span>{item.Sizes.Total.Episodes - item.Sizes.Local.Episodes} ({item.Sizes.Total.Specials - item.Sizes.Local.Specials})</span>
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
    const item = get(items, `${index}`, null);
    if (item === null) {
      const neededPage = Math.floor(index / pageSize);
      if (fetchedPages.indexOf(neededPage) === -1) {
        fetchPage(neededPage);
        return (
          <div key={key} style={style}>
            {renderPlaceholder()}
          </div>
        );
      }
      return null;
    }
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