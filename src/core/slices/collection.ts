import { createSlice } from '@reduxjs/toolkit';
import { CollectionGroup } from '../types/api/collection';

type State = {
  groups: Array<CollectionGroup>;
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    groups: [],
  } as State,
  reducers: {
    setGroups(sliceState, action) {
      sliceState.groups = action.payload;
    },
  },
});

export const { setGroups } = collectionSlice.actions;

export default collectionSlice.reducer;