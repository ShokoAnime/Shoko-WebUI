import { createSlice } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import type { CollectionGroupType } from '@/core/types/api/collection';

type State = {
  total: number;
  groups: CollectionGroupType[];
  fetchedPages: Record<number, CollectionGroupType[]>;
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
      const { items, page, total } = action.payload;
      forEach(items, (item) => {
        sliceState.groups.push(item);
      });
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

export const { resetGroups, setGroups } = collectionSlice.actions;

export default collectionSlice.reducer;
