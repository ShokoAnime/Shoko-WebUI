import { createSlice } from '@reduxjs/toolkit';

import type { SeriesInfoType, QueueStatusType } from '../types/api';
import type { DashboardSeriesSummaryType, DashboardStatsType, DashboardEpisodeDetailsType, DashboardNewsType } from '../types/api/dashboard';
import type { FileDetailedType, FileType } from '../types/api/file';
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
  recentFiles: Array<FileDetailedType>;
  recentEpisodes: Array<DashboardEpisodeDetailsType>;
  recentSeries: Array<SeriesType>;
  seriesSummary: DashboardSeriesSummaryType;
  stats: DashboardStatsType;
  unrecognizedFiles: Array<FileType>;
  unrecognizedMark: Array<string>;
  continueWatching: Array<DashboardEpisodeDetailsType>;
  nextUp: Array<DashboardEpisodeDetailsType>;
  upcomingAnime: Array<DashboardEpisodeDetailsType>;
  news: Array<DashboardNewsType>;
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
    nextUp: [],
    upcomingAnime: [],
    news: [],
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
    setNextUp(sliceState, action) {
      sliceState.nextUp = action.payload;
    },
    setUpcomingAnime(sliceState, action) {
      sliceState.upcomingAnime = action.payload;
    },
    setNews(sliceState, action) {
      sliceState.news = action.payload;
    },
  },
});

export const {
  setAvdump, setFetched, setImportFolders,
  setImportFolderSeries, setQueueStatus,
  setRecentFiles, setSeriesSummary, setStats, setUnrecognizedFiles,
  unsetFetched, setRecentEpisodes, setRecentSeries, markUnrecognizedFile,
  setContinueWatching, setUpcomingAnime, setNews, setNextUp,
} = mainpageSlice.actions;

export default mainpageSlice.reducer;
