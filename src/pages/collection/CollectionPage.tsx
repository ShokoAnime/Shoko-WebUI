import React, { useEffect } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, get, memoize } from 'lodash';
import { mdiFormatListText, mdiCogOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Events from '../../core/events';

import { RootState } from '../../core/store';
import { CollectionGroupType } from '../../core/types/api/collection';
import ShokoPanel from '../../components/Panels/ShokoPanel';


function CollectionPage() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 344; //328 + 16
  const pageSize = 50;
  const items: Array<CollectionGroupType> = useSelector((state: RootState) => state.collection.groups);
  const fetchedPages: Array<number> = useSelector((state: RootState) => state.collection.fetchedPages);
  const dispatch = useDispatch();
  
  useEffect(() => {
    debounce(() => dispatch({ type: Events.COLLECTION_PAGE_LOAD }), 100);
  }, []);

  const renderTitle = (count) => (
    <React.Fragment>
      Entire Collection
      <span className="px-2">|</span>
      <span className="text-highlight-2">{count} Items</span>
    </React.Fragment>
  );
  const renderOptions = () => (
    <div className="flex" title="Settings">
      <span className="px-2 cursor-pointer" title="View"><Icon path={mdiFormatListText} size={1} horizontal vertical rotate={180}/></span>
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
  
  const renderPlaceholder = () => (<div className="mr-4 last:mr-0 shrink-0 h-72 w-56 font-open-sans items-center justify-center flex flex-col border border-black">
    <Icon path={mdiLoading} spin size={1} />
  </div>);
  
  const fetchPage = memoize((page) => { dispatch({ type: Events.COLLECTION_GET_GROUPS, payload: page }); return true; });

  const Cell = columns => ({ columnIndex, key, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    const item = get(items, `${index}`, null);
    if (item === null) {
      const neededPage = Math.ceil((index + 1) / pageSize);
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
      {renderDetails(items[rowIndex * columns + columnIndex])}
    </div>
    );
  };
    
  
  return (
    <div className="p-9 pr-0 h-full min-w-full">
      <ShokoPanel title={renderTitle(items.length)} options={renderOptions()}>
        <AutoSizer>
          {({ width, height }) => {
            const columns = Math.floor(width / itemWidth);
            const maxPage = Math.ceil(items.length / pageSize) + 1;
            const rows = (items.length / columns) + (fetchedPages.indexOf(maxPage) === -1 ? 1 : 0);
            return (
              <Grid overscanRowCount={1} columnCount={columns} rowCount={rows} columnWidth={itemWidth} height={height} rowHeight={itemHeight} width={width} cellRenderer={Cell(columns)} />
            );
          }}
        </AutoSizer>
      </ShokoPanel>
    </div>
  );
}

export default CollectionPage;