import React, { useEffect, useRef, useState } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, find, memoize, reduce } from 'lodash';

import ListViewGroupItem from './items/ListViewGroupItem';
import GroupPlaceholder from './items/GroupPlaceholder';
import GridViewGroupItem from './items/GridViewGroupItem';
import GridOptions from './items/GridOptions';

import { setStatus } from '../../core/slices/modals/filters';
import ShokoPanel from '../../components/Panels/ShokoPanel';
import {
  useGetGroupLettersQuery,
  useLazyGetGroupsQuery,
} from '../../core/rtkQuery/splitV3Api/collectionApi';

import { resetGroups, setGroups } from '../../core/slices/collection';
import { useLazyGetGroupViewQuery } from '../../core/rtkQuery/splitV3Api/webuiApi';

import type { RootState } from '../../core/store';
import Jumpbar from './Jumpbar';

function GroupList() {
  const itemWidth = 240; //224 + 16
  const itemHeight = 374; //358 + 16
  const itemHeightList = 240; //176 + 16 + 16
  const pageSize = 50;
  const fetchedPages = useSelector(
    (state: RootState) => state.collection.fetchedPages,
  );
  const total: number = useSelector(
    (state: RootState) => state.collection.total,
  );
  const dispatch = useDispatch();
  const [mode, setMode] = useState('grid');
  const [trigger] = useLazyGetGroupsQuery();
  const [fetchMainGroups, mainGroups] = useLazyGetGroupViewQuery();
  const letters = useGetGroupLettersQuery({
    includeEmpty: false,
    topLevelOnly: true,
  });
  const gridRef = useRef<Grid>(null);
  const [columns, setColumns] = useState(0);
  const [highlightLetter, setHighlightLetter] = useState('');

  const toggleMode = () => {
    setMode(mode === 'list' ? 'grid' : 'list');
  };

  const fetchPage = debounce(
    memoize((page) => {
      trigger({ page, pageSize }).then(
        (result) => {
          if (!result.data) {
            return;
          }
          dispatch(
            setGroups({
              total: result.data.Total,
              items: result.data.List,
              page,
            }),
          );

          //TODO: figure out how to only fetch it in list mode
          const ids = reduce(
            result.data.List,
            (out, value) => {
              out.push(value.IDs.ID);
              return out;
            },
            [] as Array<number>,
          );
          fetchMainGroups({
            GroupIDs: ids,
            TagFilter: 128,
            TagLimit: 20,
            OrderByName: true,
          }).then(
            () => {},
            (reason) => {
              console.error(reason);
            },
          );
        },
        (reason) => {
          console.error(reason);
        },
      );
      return true;
    }),
    200,
  );

  useEffect(() => {
    dispatch(resetGroups());
    fetchPage(1);
    return () => {
      dispatch(setStatus(false)); //Close filters
    };
  }, []);

  const showFilters = () => {
    dispatch(setStatus(true));
  };

  const renderTitle = count => (
    <React.Fragment>
      Entire Collection
      <span className='px-2'>|</span>
      <span className='text-highlight-2'>{count} Items</span>
    </React.Fragment>
  );

  const Cell =
    cols =>
      ({ columnIndex, key, rowIndex, style }) => {
        const index = rowIndex * cols + columnIndex;
        const neededPage = Math.ceil((index + 1) / pageSize);
        const groupList = fetchedPages[neededPage];
        if (cols !== columns) {
          setColumns(cols);
        }
        if (groupList == undefined) {
          fetchPage(neededPage);
          return <GroupPlaceholder id={key} style={style} />;
        }
        const item = groupList[index % pageSize];
        if (!item) {
          return null;
        }
        const shouldHighlight =
        highlightLetter.toLowerCase() === item.Name[0].toLowerCase();
        return (
        <div
          key={key}
          style={style}
          className={`${shouldHighlight ? 'animate-pulse' : ''}`}
        >
          {mode === 'grid'
            ? GridViewGroupItem(item)
            : ListViewGroupItem(
              item,
              find(mainGroups?.data, ['ID', item?.IDs.ID]),
            )}
          {mode === 'list' && (
            <div className='bg-background-border my-4 h-0.5 w-full' />
          )}
        </div>
        );
      };

  return (
    <div className='p-9 pr-0 h-full min-w-full flex'>
      <ShokoPanel
        className='grow'
        title={renderTitle(total)}
        options={
          <GridOptions showFilters={showFilters} toggleMode={toggleMode} />
        }
      >
        <AutoSizer>
          {({ width, height }) => {
            const gridColumns =
              mode === 'grid' ? Math.floor(width / itemWidth) : 1;
            const rows =
              mode === 'grid' ? Math.ceil(total / gridColumns) : total;
            return (
              <Grid
                ref={gridRef}
                className='grow'
                overscanRowCount={1}
                columnCount={gridColumns}
                rowCount={rows}
                columnWidth={mode === 'grid' ? itemWidth : width - 32}
                height={height}
                rowHeight={mode === 'grid' ? itemHeight : itemHeightList}
                width={width}
                cellRenderer={Cell(gridColumns)}
              />
            );
          }}
        </AutoSizer>
      </ShokoPanel>
      <Jumpbar items={letters?.data} columns={columns} gridRef={gridRef} onJump={key => setHighlightLetter(key)}/>
    </div>
  );
}

export default GroupList;
