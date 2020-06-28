import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type uiType = {
  theme: string;
  notifications: boolean;
};

type updateChannelType = 'stable' | 'unstable';

type State = {
  actions: Array<string>,
  ui: uiType
  updateChannel: updateChannelType;
  logDelta: number;
};

const initialState = {
  actions: [
    'remove-missing-files-mylist',
    'update-series-stats',
    'update-all-anidb-info',
    'update-all-tvdb-info',
    'plex-sync-all',
  ],
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
    addAction(sliceState, action: PayloadAction<string>) {
      sliceState.actions.push(action.payload);
    },
    removeAction(sliceState, action: PayloadAction<string>) {
      const tempSet = new Set(sliceState.actions);
      tempSet.delete(action.payload);
      sliceState.actions = Array.from(tempSet);
    },
  },
});

export const {
  setUi, setUpdateChannel, setLogDelta, saveWebUISettings,
  addAction, removeAction,
} = webuiSettingsSlice.actions;

export default webuiSettingsSlice.reducer;
