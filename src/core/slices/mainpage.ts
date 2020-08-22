import { createSlice } from '@reduxjs/toolkit';

import type { SeriesInfoType, QueueStatusType } from '../types/api';
import type { DashboardSeriesSummaryType, DashboardStatsType } from '../types/api/dashboard';
import type { RecentFileDetailsType, RecentFileType } from '../types/api/file';
import type { ImportFolderType } from '../types/api/import-folder';

type State = {
  activeTab: string;
  avdump: {
    [key: string]: {
      fetching: boolean;
      hash?: string;
    },
  };
  fetched: {
    [key: string]: boolean,
  };
  importFolders: Array<ImportFolderType>;
  importFolderSeries: Array<SeriesInfoType>;
  queueStatus: QueueStatusType;
  recentFileDetails: {
    [key: number]: {
      fetched: boolean;
      details: RecentFileDetailsType;
    }
  };
  recentFiles: Array<RecentFileType>;
  seriesSummary: DashboardSeriesSummaryType;
  stats: DashboardStatsType;
  unrecognizedFiles: Array<Omit<RecentFileType, 'SeriesIDs'>>
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    activeTab: 'dashboard',
    avdump: {},
    fetched: {},
    importFolders: [],
    importFolderSeries: [],
    queueStatus: {} as QueueStatusType,
    recentFiles: [],
    recentFileDetails: {},
    selectedImportFolderSeries: 1,
    seriesSummary: {
      Series: 0,
      OVA: 0,
      Movie: 0,
      Other: 0,
    },
    stats: {},
    unrecognizedFiles: [],
  } as State,
  reducers: {
    setActiveTab(sliceState, action) {
      sliceState.activeTab = action.payload;
    },
    setAvdump(sliceState, action) {
      sliceState.avdump = Object.assign({}, sliceState.avdump, action.payload);
    },
    setFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: true });
    },
    setImportFolders(sliceState, action) {
      sliceState.importFolders = action.payload;
    },
    setImportFolderSeries(sliceState, action) {
      sliceState.importFolderSeries = action.payload;
    },
    setQueueStatus(sliceState, action) {
      sliceState.queueStatus = Object.assign({}, sliceState.queueStatus, action.payload);
    },
    setRecentFileDetails(sliceState, action) {
      sliceState.recentFileDetails = Object.assign(
        {}, sliceState.recentFileDetails, action.payload,
      );
    },
    setRecentFiles(sliceState, action) {
      sliceState.recentFiles = action.payload;
    },
    setSeriesSummary(sliceState, action) {
      sliceState.seriesSummary = Object.assign({}, sliceState.seriesSummary, action.payload);
    },
    setStats(sliceState, action) {
      sliceState.stats = action.payload;
    },
    setUnrecognizedFiles(sliceState, action) {
      sliceState.unrecognizedFiles = action.payload;
    },
    unsetFetched(sliceState, action) {
      sliceState.fetched = Object.assign({}, sliceState.fetched, { [action.payload]: false });
    },
  },
});

export const {
  setActiveTab, setAvdump, setFetched, setImportFolders,
  setImportFolderSeries, setQueueStatus, setRecentFileDetails,
  setRecentFiles, setSeriesSummary, setStats, setUnrecognizedFiles,
  unsetFetched,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
