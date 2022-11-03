import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LayoutItemType = {
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

export type LayoutType = {
  [breakpoint: string]: Array<LayoutItemType>
};

type UpdateChannelType = 'stable' | 'unstable';

type State = {
  webui_v2: {
    actions: Array<string>,
    layout: {
      [key: string]: LayoutType;
    },
    notifications: boolean;
    theme: string;
    toastPosition: 'top-right' | 'bottom-right';
    updateChannel: UpdateChannelType;
  }
};

export const defaultLayout = {
  dashboard: {
    lg: [{
      i: 'collectionBreakdown', x: 0, y: 0, w: 2, h: 16, minW: 2, moved: false, static: false,
    }, {
      i: 'collectionTypeBreakdown', x: 2, y: 0, w: 2, h: 16, moved: false, static: false,
    }, {
      i: 'queueProcessor', x: 4, y: 0, w: 8, h: 16, minW: 6, moved: false, static: false,
    }, {
      i: 'recentlyImported', x: 0, y: 16, w: 12, h: 19, minW: 12, minH: 19, moved: false, static: false,
    }, {
      i: 'shokoNews', x: 0, y: 35, w: 3, h: 14, moved: false, static: false,
    }, {
      i: 'importFolders', x: 3, y: 35, w: 3, h: 14, moved: false, static: false,
    }, {
      i: 'importBreakdown', x: 6, y: 35, w: 6, h: 14, moved: false, static: false,
    }, {
      i: 'continueWatching', x: 0, y: 49, w: 12, h: 19, minW: 12, minH: 19, moved: false, static: false,
    }, {
      i: 'nextUp', x: 0, y: 61, w: 12, h: 19, minW: 12, minH: 19, moved: false, static: false,
    }, {
      i: 'upcomingAnime', x: 0, y: 73, w: 12, h: 20, minW: 12, minH: 20, moved: false, static: false,
    }],
  } as LayoutType,
  importFolders: {
    lg: [{
      i: 'importBreakdown', x: 0, y: 0, w: 8, h: 11, moved: false, static: false,
    }, {
      i: 'importFolders', x: 8, y: 0, w: 4, h: 11, moved: false, static: false,
    }, {
      i: 'seriesInImportFolder', x: 0, y: 11, w: 12, h: 11, moved: false, static: false,
    }],
  } as LayoutType,
  actions: {
    lg: [{
      i: 'anidb', x: 0, y: 0, w: 4, h: 9, minW: 3, minH: 5, maxH: 12, moved: false, static: false,
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
  } as LayoutType,
  settings: {
    lg: [{
      i: 'general', x: 0, y: 0, w: 4, h: 22, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'anidb-login', x: 0, y: 22, w: 4, h: 11, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'relation', x: 0, y: 33, w: 4, h: 15, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'anidb', x: 4, y: 0, w: 4, h: 28, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'import', x: 4, y: 28, w: 4, h: 11, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'plex', x: 4, y: 39, w: 4, h: 9, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'tvdb', x: 8, y: 0, w: 4, h: 17, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'moviedb', x: 8, y: 17, w: 4, h: 10, minW: 3, minH: 5, moved: false, static: false,
    }, {
      i: 'language', x: 8, y: 27, w: 4, h: 12, minW: 3, minH: 3, moved: false, static: false,
    }, {
      i: 'trakt', x: 8, y: 39, w: 4, h: 9, minW: 3, minH: 3, moved: false, static: false,
    }],
  } as LayoutType,
};

const initialState = {
  webui_v2: {
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
    saveWebUISettings(sliceState, action: PayloadAction<any>) {
      sliceState.webui_v2 = Object.assign({}, sliceState.webui_v2, action.payload);
    },
    addAction(sliceState, action: PayloadAction<string>) {
      sliceState.webui_v2.actions.push(action.payload);
    },
    removeAction(sliceState, action: PayloadAction<string>) {
      const tempSet = new Set(sliceState.webui_v2.actions);
      tempSet.delete(action.payload);
      sliceState.webui_v2.actions = Array.from(tempSet);
    },
    saveLayout(sliceState, action) {
      sliceState.webui_v2.layout = Object.assign({}, sliceState.webui_v2.layout, action.payload);
    },
  },
});

export const {
  saveWebUISettings, saveLayout,
  addAction, removeAction,
} = webuiSettingsSlice.actions;

export default webuiSettingsSlice.reducer;
