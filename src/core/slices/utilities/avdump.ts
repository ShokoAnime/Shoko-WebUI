import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';

type AvDumpItem = {
  hash: string;
  fetching: boolean;
};

type State = {
  [key: number]: AvDumpItem;
};

const  avdumpSlice = createSlice({
  name: 'avdump',
  initialState: {} as State,
  reducers: {
    setItem(sliceState, action: PayloadAction<AvDumpItem & { id: number }>) {
      sliceState[action.payload.id] = omit(action.payload, 'id');
    },
  },
});

export const { setItem } = avdumpSlice.actions;

export default avdumpSlice.reducer;
