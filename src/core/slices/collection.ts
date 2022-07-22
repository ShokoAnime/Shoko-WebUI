import { createSlice } from '@reduxjs/toolkit';
import { CollectionGroupType } from '../types/api/collection';
import { forEach } from 'lodash';

type State = {
  groups: Array<CollectionGroupType>;
  fetchedPages: Array<number>;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    groups: [],
    fetchedPages: [],
  } as State,
  reducers: {
    setGroups(sliceState, action) {
      const { items, page } = action.payload;
      forEach(items, (item) => { sliceState.groups.push(item); });
      sliceState.fetchedPages.push(page);
    },
  },
});

export const { setGroups } = collectionSlice.actions;

export default collectionSlice.reducer;