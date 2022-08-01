import { createSlice } from '@reduxjs/toolkit';
import { CollectionGroupType } from '../types/api/collection';
import { forEach } from 'lodash';

import type { SeriesType } from '../types/api/series';

type State = {
  total: number;
  groups: Array<CollectionGroupType>;
  fetchedPages: Record<number, Array<CollectionGroupType>>;
  groupSeries: Array<SeriesType>;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    total: 0,
    groups: [],
    fetchedPages: {},
    groupSeries: [],
  } as State,
  reducers: {
    setGroups(sliceState, action) {
      const { total, items, page } = action.payload;
      forEach(items, (item) => { sliceState.groups.push(item); });
      sliceState.fetchedPages[page] = items;
      sliceState.total = total;
    },
    setGroupSeries(sliceState, action) {
      sliceState.groupSeries = [...action.payload];
    },
  },
});

export const { setGroups, setGroupSeries } = collectionSlice.actions;

export default collectionSlice.reducer;