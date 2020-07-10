import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type layoutItemType = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  moved?: boolean;
};

export type layoutType = {
  [breakpoint: string]: Array<layoutItemType>
};

type updateChannelType = 'stable' | 'unstable';

type State = {
  actions: Array<string>,
  layout: {
    [key: string]: layoutType;
  },
  notifications: boolean;
  theme: string;
  updateChannel: updateChannelType;
};

export const defaultLayout = {
  dashboard: {
    lg: [{
      i: 'collectionBreakdown', x: 0, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
    }, {
      i: 'seriesBreakdown', x: 6, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8,
    }, {
      i: 'commandQueue', x: 0, y: 6, w: 5, h: 9, minW: 5, minH: 5,
    }, {
      i: 'importFolders', x: 5, y: 6, w: 4, h: 9,
    }, {
      i: 'importBreakdown', x: 0, y: 15, w: 9, h: 11,
    }, {
      i: 'actionItems', x: 9, y: 11, w: 3, h: 9,
    }, {
      i: 'filesBreakdown', x: 9, y: 15, w: 3, h: 11,
    }],
  },
  importFolders: {
    lg: [{
      i: 'importBreakdown', x: 0, y: 0, w: 8, h: 11,
    }, {
      i: 'importFolders', x: 8, y: 0, w: 4, h: 11,
    }, {
      i: 'seriesInImportFolder', x: 0, y: 11, w: 12, h: 11,
    }],
  },
  actions: {
    lg: [{
      i: 'anidb', x: 0, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
    }, {
      i: 'shoko', x: 4, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
    }, {
      i: 'import', x: 8, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
    }, {
      i: 'moviedb', x: 0, y: 14, w: 4, h: 4, minW: 3, minH: 4, maxH: 10,
    }, {
      i: 'images', x: 4, y: 9, w: 4, h: 9, minW: 3, minH: 5, maxH: 10,
    }, {
      i: 'plex', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 4, maxH: 10,
    }, {
      i: 'trakt', x: 8, y: 14, w: 4, h: 5, minW: 3, minH: 5, maxH: 10,
    }, {
      i: 'tvdb', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 5, maxH: 10,
    }],
  },
  settings: {
    lg: [{
      i: 'anidb', x: 4, y: 0, w: 4, h: 20, minW: 3, minH: 5,
    }, {
      i: 'moviedb', x: 8, y: 13, w: 4, h: 7, minW: 3, minH: 5,
    }, {
      i: 'tvdb', x: 8, y: 0, w: 4, h: 13, minW: 3, minH: 5,
    }, {
      i: 'general', x: 0, y: 0, w: 4, h: 13, minW: 3, minH: 5,
    }, {
      i: 'anidb-login', x: 0, y: 13, w: 4, h: 7, minW: 3, minH: 5,
    }],
  },
};

const initialState = {
  actions: [
    'remove-missing-files-mylist',
    'update-series-stats',
    'update-all-anidb-info',
    'update-all-tvdb-info',
    'plex-sync-all',
  ],
  layout: defaultLayout,
  notifications: true,
  theme: '',
  updateChannel: 'stable',
} as State;

const webuiSettingsSlice = createSlice({
  name: 'webuiSettings',
  initialState,
  reducers: {
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
    saveLayout(sliceState, action) {
      sliceState.layout = Object.assign(sliceState.layout, action.payload);
    },
  },
});

export const {
  saveWebUISettings, saveLayout,
  addAction, removeAction,
} = webuiSettingsSlice.actions;

export default webuiSettingsSlice.reducer;
