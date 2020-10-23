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
  static: boolean;
  moved: boolean;
};

export type layoutType = {
  [breakpoint: string]: Array<layoutItemType>
};

type updateChannelType = 'stable' | 'unstable';

type State = {
  v3: {
    actions: Array<string>,
    layout: {
      [key: string]: layoutType;
    },
    notifications: boolean;
    theme: string;
    toastPosition: 'top-right' | 'bottom-right';
    updateChannel: updateChannelType;
  }
};

export const defaultLayout = {
  dashboard: {
    lg: [{
      i: 'collectionBreakdown', x: 0, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8, moved: false, static: false,
    }, {
      i: 'seriesBreakdown', x: 6, y: 0, w: 6, h: 6, minW: 5, minH: 6, maxH: 8, moved: false, static: false,
    }, {
      i: 'commandQueue', x: 0, y: 6, w: 5, h: 10, minW: 5, minH: 5, moved: false, static: false,
    }, {
      i: 'importFolders', x: 5, y: 6, w: 4, h: 10, moved: false, static: false,
    }, {
      i: 'importBreakdown', x: 0, y: 16, w: 9, h: 11, moved: false, static: false,
    }, {
      i: 'actionItems', x: 9, y: 6, w: 3, h: 10, moved: false, static: false,
    }, {
      i: 'filesBreakdown', x: 9, y: 16, w: 3, h: 11, moved: false, static: false,
    }],
  },
  importFolders: {
    lg: [{
      i: 'importBreakdown', x: 0, y: 0, w: 8, h: 11, moved: false, static: false,
    }, {
      i: 'importFolders', x: 8, y: 0, w: 4, h: 11, moved: false, static: false,
    }, {
      i: 'seriesInImportFolder', x: 0, y: 11, w: 12, h: 11, moved: false, static: false,
    }],
  },
  actions: {
    lg: [{
      i: 'anidb', x: 0, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }, {
      i: 'shoko', x: 4, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }, {
      i: 'import', x: 8, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }, {
      i: 'moviedb', x: 0, y: 14, w: 4, h: 4, minW: 3, minH: 4, maxH: 10, moved: false, static: false,
    }, {
      i: 'images', x: 4, y: 9, w: 4, h: 9, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }, {
      i: 'plex', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 4, maxH: 10, moved: false, static: false,
    }, {
      i: 'trakt', x: 8, y: 14, w: 4, h: 5, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }, {
      i: 'tvdb', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 5, maxH: 10, moved: false, static: false,
    }],
  },
  settings: {
    lg: [{
      i: 'anidb', x: 4, y: 0, w: 4, h: 22, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'moviedb', x: 8, y: 12, w: 4, h: 7, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'tvdb', x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'general', x: 0, y: 0, w: 4, h: 15, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'anidb-login', x: 0, y: 15, w: 4, h: 7, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'plex', x: 0, y: 22, w: 4, h: 6, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'trakt', x: 4, y: 22, w: 4, h: 6, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'relation', x: 8, y: 19, w: 4, h: 9, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'language', x: 0, y: 28, w: 4, h: 9, minW: 3, minH: 3, moved: false, static: false,
    }],
  },
};

const initialState = {
  v3: {
    actions: [
      'remove-missing-files-mylist',
      'update-series-stats',
      'update-all-anidb-info',
      'update-all-tvdb-info',
      'plex-sync-all',
      'run-import',
    ],
    layout: defaultLayout,
    notifications: true,
    theme: '',
    toastPosition: 'bottom-right',
    updateChannel: 'stable',
  },
} as State;

const webuiSettingsSlice = createSlice({
  name: 'webuiSettings',
  initialState,
  reducers: {
    saveWebUISettings(sliceState, action: PayloadAction<Partial<State>>) {
      sliceState.v3 = Object.assign({}, sliceState.v3, action.payload);
    },
    addAction(sliceState, action: PayloadAction<string>) {
      sliceState.v3.actions.push(action.payload);
    },
    removeAction(sliceState, action: PayloadAction<string>) {
      const tempSet = new Set(sliceState.v3.actions);
      tempSet.delete(action.payload);
      sliceState.v3.actions = Array.from(tempSet);
    },
    saveLayout(sliceState, action) {
      sliceState.v3.layout = Object.assign({}, sliceState.v3.layout, action.payload);
    },
  },
});

export const {
  saveWebUISettings, saveLayout,
  addAction, removeAction,
} = webuiSettingsSlice.actions;

export default webuiSettingsSlice.reducer;
