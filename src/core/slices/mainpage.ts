import { createSlice } from '@reduxjs/toolkit';

import type { SeriesInfoType, QueueStatusType } from '../types/api';
import type { DashboardSeriesSummaryType, DashboardStatsType, DashboardEpisodeDetailsType } from '../types/api/dashboard';
import type { RecentEpisodeDetailsType, RecentSeriesDetailsType, RecentFileDetailsType, FileDetailedType, FileType } from '../types/api/file';
import type { ImportFolderType } from '../types/api/import-folder';
import type { SeriesType } from '../types/api/series';

type State = {
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
  recentSeriesDetails: {
    [key: number]: {
      fetched: boolean;
      details: RecentSeriesDetailsType;
    }
  };
  recentEpisodeDetails: {
    [key: number]: {
      fetched: boolean;
      details: RecentEpisodeDetailsType;
    }
  };
  recentFiles: Array<FileDetailedType>;
  recentEpisodes: Array<DashboardEpisodeDetailsType>;
  recentSeries: Array<SeriesType>;
  seriesSummary: DashboardSeriesSummaryType;
  stats: DashboardStatsType;
  unrecognizedFiles: Array<FileType>;
  unrecognizedMark: Array<string>;
  continueWatching: Array<DashboardEpisodeDetailsType>;
  upcomingAnime: Array<DashboardEpisodeDetailsType>;
};

const mainpageSlice = createSlice({
  name: 'mainpage',
  initialState: {
    avdump: {},
    fetched: {},
    importFolders: [],
    importFolderSeries: [],
    queueStatus: {} as QueueStatusType,
    recentFiles: [],
    recentEpisodes: [],
    recentSeries: [],
    recentFileDetails: {},
    recentSeriesDetails: {},
    recentEpisodeDetails: {},
    selectedImportFolderSeries: 1,
    seriesSummary: {
      Series: 0,
      OVA: 0,
      Movie: 0,
      Other: 0,
    },
    stats: {},
    unrecognizedFiles: [],
    unrecognizedMark: [],
    continueWatching: [],
    upcomingAnime: [],
  } as State,
  reducers: {
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
    setRecentSeries(sliceState, action) {
      sliceState.recentSeries = action.payload;
    },
    setRecentEpisodes(sliceState, action) {
      sliceState.recentEpisodes = action.payload;
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
    markUnrecognizedFile(sliceState, action) {
      sliceState.unrecognizedMark = action.payload.state === true ? [...sliceState.unrecognizedMark, action.payload.id] : sliceState.unrecognizedMark.filter(id => id !== action.payload.id);
    },
    setContinueWatching(sliceState, action) {
      sliceState.continueWatching = action.payload;
    },
    setUpcomingAnime(sliceState, action) {
      sliceState.upcomingAnime = action.payload;
    },
  },
});

export const {
  setAvdump, setFetched, setImportFolders,
  setImportFolderSeries, setQueueStatus, setRecentFileDetails,
  setRecentFiles, setSeriesSummary, setStats, setUnrecognizedFiles,
  unsetFetched, setRecentEpisodes, setRecentSeries,
  markUnrecognizedFile, setContinueWatching, setUpcomingAnime,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
