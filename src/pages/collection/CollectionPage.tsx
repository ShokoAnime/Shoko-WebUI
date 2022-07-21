import React, { useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';

import Events from '../../core/events';

import { RootState } from '../../core/store';
import { CollectionGroupType } from '../../core/types/api/collection';

function CollectionPage() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 344; //328 + 16
  const items: Array<CollectionGroupType> = useSelector((state: RootState) => state.collection.groups);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch({ type: Events.COLLECTION_PAGE_LOAD });
  }, []);
  
  const renderDetails = (item: CollectionGroupType) => {
    const posters = item.Images.Posters.filter(p => p.Source === 'AniDB');
    
    return (
      <div key={`group-${item.IDs.ID}`} className="mr-4 last:mr-0 shrink-0 w-56 font-open-sans content-center flex flex-col">
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/AniDB/Poster/${posters[0].ID}')` }} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
        <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
      </div>
    );
  };

  const Cell = columns => ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      {renderDetails(items[rowIndex * columns + columnIndex])}
    </div>
  );
  
  return (
    <div className="p-9 pr-0 h-full min-w-full">
      <AutoSizer>
        {({ width, height }) => {
          const columns = parseInt((width / itemWidth).toFixed(0));
          const rows = items.length / columns;
          return (
            <Grid columnCount={columns} rowCount={rows} columnWidth={itemWidth} height={height} rowHeight={itemHeight} width={width}>{Cell(columns)}</Grid>
          );
        }}
      </AutoSizer>
      {/*{items.map(item => renderDetails(item))}*/}
    </div>
  );
}

export default CollectionPage;