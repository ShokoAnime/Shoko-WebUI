import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type uiType = {
  theme: string;
  notifications: boolean;
};

type updateChannelType = 'stable' | 'unstable';

type State = {
  ui: uiType
  updateChannel: updateChannelType;
  logDelta: number;
};

const initialState = {
  ui: {
    theme: '',
    notifications: true,
  },
  updateChannel: 'stable',
  logDelta: 100,
} as State;

const webuiSettingsSlice = createSlice({
  name: 'webuiSettings',
  initialState,
  reducers: {
    setUi(sliceState, action: PayloadAction<uiType>) {
      sliceState.ui = Object.assign(sliceState.ui, action.payload);
    },
    setUpdateChannel(sliceState, action: PayloadAction<updateChannelType>) {
      sliceState.updateChannel = action.payload;
    },
    setLogDelta(sliceState, action: PayloadAction<number>) {
      sliceState.logDelta = action.payload;
    },
    saveWebUISettings(sliceState, action: PayloadAction<Partial<State>>) {
      return Object.assign(sliceState, action.payload);
    },
  },
});

export const {
  setUi, setUpdateChannel, setLogDelta, saveWebUISettings,
} = webuiSettingsSlice.actions;

export default webuiSettingsSlice.reducer;
