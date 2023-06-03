import { createSlice } from '@reduxjs/toolkit';
import { CollectionGroupType } from '@/core/types/api/collection';
import { forEach } from 'lodash';

type State = {
  total: number;
  groups: Array<CollectionGroupType>;
  fetchedPages: Record<number, Array<CollectionGroupType>>;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    total: 0,
    groups: [],
    fetchedPages: {},
  } as State,
  reducers: {
    setGroups(sliceState, action) {
      const { total, items, page } = action.payload;
      forEach(items, (item) => { sliceState.groups.push(item); });
      sliceState.fetchedPages[page] = items;
      sliceState.total = total;
    },
    resetGroups(sliceState) {
      sliceState.groups = [];
      sliceState.fetchedPages = {};
      sliceState.total = 0;
    },
  },
});

export const { setGroups, resetGroups } = collectionSlice.actions;

export default collectionSlice.reducer;