import React, { useEffect, useState } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';
import { memoize, debounce, reduce, find } from 'lodash';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';

import ListViewGroupItem from './items/ListViewGroupItem';
import GroupPlaceholder from './items/GroupPlaceholder';
import GridViewGroupItem from './items/GridViewGroupItem';
import GridOptions from './items/GridOptions';

import { setStatus } from '../../core/slices/modals/filters';
import ShokoPanel from '../../components/Panels/ShokoPanel';
import { useLazyGetFilterGroupsQuery, useGetFilterQuery } from '../../core/rtkQuery/splitV3Api/collectionApi';

import { RootState } from '../../core/store';
import type { CollectionFilterType } from '../../core/types/api/collection';
import { resetGroups, setGroups } from '../../core/slices/collection';
import { useLazyGetGroupViewQuery } from '../../core/rtkQuery/splitV3Api/webuiApi';


function FilterGroupList() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 374; //328 + 16
  const itemHeightList = 224; //176 + 16
  const pageSize = 50;
  const fetchedPages = useSelector((state: RootState) => state.collection.fetchedPages);
  const total: number = useSelector((state: RootState) => state.collection.total);
  const dispatch = useDispatch();
  const { filterId } = useParams();
  const [mode, setMode] = useState('grid');
  const [trigger] = useLazyGetFilterGroupsQuery();
  const filterData = useGetFilterQuery({ filterId });
  const filter = filterData?.data ?? { Name: '??' } as CollectionFilterType;
  const [fetchMainGroups, mainGroups] = useLazyGetGroupViewQuery();

  const toggleMode = () => { setMode(mode === 'list' ? 'grid' : 'list'); };

  const fetchPage = debounce(memoize((page) => {
    trigger({ page, pageSize, filterId }).then((result) => {
      if (!result.data) { return; }
      dispatch(setGroups({ total: result.data.Total, items: result.data.List, page }));
      
      //TODO: figure out how to only fetch it in list mode
      const ids = reduce(result.data.List, (out, value) => { 
        out.push(value.IDs.ID); 
        return out;
      }, [] as Array<number>);
      fetchMainGroups({ GroupIDs: ids, TagFilter: 0 }).then(() => {}, (reason) => { console.error(reason); });
    }, (reason) => { console.error(reason); });
    return true;
  }), 200);

  useEffect(() => {
    dispatch(resetGroups());
    fetchPage(1);
    return () => {
      dispatch(setStatus(false)); //Close filters
    };
  }, [filterId]);

  const showFilters = () => {
    dispatch(setStatus(true));
  };

  const renderTitle = count => (
    <React.Fragment>
      <Link to="/webui/collection" className="text-highlight-1">Entire Collection</Link>
      <span className="px-2">&gt;</span>
      {filter.Name}
      <span className="px-2">|</span>
      <span className="text-highlight-2">{count} Items</span>
    </React.Fragment>
  );

  const Cell = columns => ({ columnIndex, key, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    const neededPage = Math.ceil((index + 1) / pageSize);
    const groupList = fetchedPages[neededPage];
    if (groupList == undefined) {
      fetchPage(neededPage);
      return (
        <GroupPlaceholder id={key} style={style}/>
      );
    }
    const item = groupList[index % pageSize];
    if (!item) { return null; }
    return (
    <div key={key} style={style}>
      {mode === 'grid' ? GridViewGroupItem(item) : ListViewGroupItem(item, find(mainGroups?.data, ['ID', item?.IDs.ID]))}
    </div>
    );
  };

  return (
    <div className="p-9 pr-0 h-full min-w-full">
      <ShokoPanel title={renderTitle(total)} options={<GridOptions showFilters={showFilters} toggleMode={toggleMode} />}>
        <AutoSizer>
          {({ width, height }) => {
            const columns = mode === 'grid' ? Math.floor(width / itemWidth) : 1;
            const rows = mode === 'grid' ? Math.ceil(total / columns) : total;
            return (
              <Grid overscanRowCount={1} columnCount={columns} rowCount={rows} columnWidth={mode === 'grid' ? itemWidth : width - 32} height={height} rowHeight={mode === 'grid' ? itemHeight : itemHeightList} width={width} cellRenderer={Cell(columns)} />
            );
          }}
        </AutoSizer>
      </ShokoPanel>
    </div>
  );
}

export default FilterGroupList;
