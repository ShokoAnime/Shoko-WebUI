import { createSlice } from '@reduxjs/toolkit';
import { CollectionGroupType } from '../types/api/collection';

type State = {
  groups: Array<CollectionGroupType>;
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