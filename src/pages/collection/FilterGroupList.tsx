import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, find, memoize, reduce } from 'lodash';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router';

import ListViewGroupItem from './items/ListViewGroupItem';
import GroupPlaceholder from './items/GroupPlaceholder';
import GridViewGroupItem from './items/GridViewGroupItem';
import GridOptions from './items/GridOptions';

import { setStatus } from '@/core/slices/modals/filters';
import { useGetFilterQuery, useLazyGetFilterGroupsQuery } from '@/core/rtkQuery/splitV3Api/collectionApi';

import { RootState } from '@/core/store';
import type { CollectionFilterType } from '@/core/types/api/collection';
import { resetGroups, setGroups } from '@/core/slices/collection';
import { useLazyGetGroupViewQuery } from '@/core/rtkQuery/splitV3Api/webuiApi';

import GroupGrid from './items/GroupGrid';
import cx from 'classnames';

function FilterGroupList() {
  const pageSize = 50;
  const fetchedPages = useSelector((state: RootState) => state.collection.fetchedPages);
  const total: number = useSelector((state: RootState) => state.collection.total);
  const dispatch = useDispatch();
  const { filterId } = useParams();
  const [mode, setMode] = useState('grid');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [trigger] = useLazyGetFilterGroupsQuery();
  const filterData = useGetFilterQuery({ filterId });
  const filter = filterData?.data ?? { Name: '??' } as CollectionFilterType;
  const [fetchMainGroups, mainGroups] = useLazyGetGroupViewQuery();
  const [columns, setColumns] = useState(0);

  const toggleMode = () => { setMode(mode === 'list' ? 'grid' : 'list'); };

  const toggleFilters = () => { setShowFilterSidebar(!showFilterSidebar); };

  const fetchPage = debounce(memoize((page) => {
    trigger({ page, pageSize, filterId }).then((result) => {
      if (!result.data) { return; }
      dispatch(setGroups({ total: result.data.Total, items: result.data.List, page }));
      
      //TODO: figure out how to only fetch it in list mode
      const ids = reduce(result.data.List, (out, value) => { 
        out.push(value.IDs.ID); 
        return out;
      }, [] as Array<number>);
      fetchMainGroups({ GroupIDs: ids, TagFilter: 128, TagLimit: 20, OrderByName: true }).then(() => {}, (reason) => { console.error(reason); });
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

  const showServerFilters = () => {
    dispatch(setStatus(true));
  };

  const renderTitle = count => (
    <div className="font-semibold text-xl">
      <Link to="/webui/collection" className="text-highlight-1">Entire Collection</Link>
      <span className="px-2">&gt;</span>
      {filter.Name}
      <span className="px-2">|</span>
      <span className="text-highlight-2">{count} Items</span>
    </div>
  );

  const Cell = cols => ({ columnIndex, key, rowIndex, style }) => {
    const index = rowIndex * cols + columnIndex;
    const neededPage = Math.ceil((index + 1) / pageSize);
    const groupList = fetchedPages[neededPage];
    if (cols !== columns) {
      setColumns(cols);
    }
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
      {mode === 'list' && <div className="bg-background-border my-4 h-0.5 w-full" />}
    </div>
    );
  };

  return (
    <div className="h-full min-w-full flex flex-col gap-y-8">
      <div className="rounded bg-background-alt p-8 flex justify-between items-center border-background-border border">
        <div>{renderTitle(total)}</div>
        <GridOptions showFilters={toggleFilters} toggleMode={toggleMode} showServerFilters={showServerFilters} />
      </div>
      <div className="flex">
        <GroupGrid mode={mode} cellRenderer={Cell} total={total} />
        <div className={cx('flex items-start overflow-hidden transition-all', showFilterSidebar ? 'w-[25.9375rem] opacity-100 ml-8' : 'w-0 opacity-0')}>
          <div className="rounded bg-background-alt p-8 flex grow border-background-border border justify-center items-center">Filter sidebar</div>
        </div>
      </div>
    </div>
  );
}

export default FilterGroupList;
