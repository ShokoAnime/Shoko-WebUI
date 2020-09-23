import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { SettingsServerType } from '../types/api/settings';

export const initialState = {
  WebUI_Settings: '',
  FirstRun: false,
  Database: {
    MySqliteDirectory: '',
    DatabaseBackupDirectory: '',
    Type: 'SQLite',
    Username: '',
    Password: '',
    Schema: '',
    Hostname: '',
    SQLite_DatabaseFile: '',
  },
  AniDb: {
    Username: '',
    Password: '',
    AVDumpKey: '',
    ClientPort: 4556,
    AVDumpClientPort: 4557,
    DownloadCharacters: false,
    DownloadCreators: false,
    DownloadRelatedAnime: true,
    MaxRelationDepth: 3,
    MyList_AddFiles: false,
    MyList_DeleteType: 0,
    MyList_ReadUnwatched: false,
    MyList_ReadWatched: false,
    MyList_SetUnwatched: false,
    MyList_SetWatched: false,
    MyList_StorageState: 0,
    Calendar_UpdateFrequency: 1,
    Anime_UpdateFrequency: 1,
    MyList_UpdateFrequency: 1,
    MyListStats_UpdateFrequency: 1,
    File_UpdateFrequency: 1,
  },
  TvDB: {
    AutoLink: true,
    AutoFanart: true,
    AutoFanartAmount: 10,
    AutoWideBanners: true,
    AutoWideBannersAmount: 10,
    AutoPosters: true,
    AutoPostersAmount: 10,
    UpdateFrequency: 1,
    Language: 'en',
  },
  MovieDb: {
    AutoFanart: true,
    AutoFanartAmount: 10,
    AutoPosters: true,
    AutoPostersAmount: 10,
  },
  TraktTv: {
    Enabled: false,
    TokenExpirationDate: '',
    UpdateFrequency: 1,
    SyncFrequency: 1,
  },
  Plex: {
    Server: '',
    Libraries: [],
    Token: '',
  },
  LogRotator: {
    Enabled: true,
    Zip: true,
    Delete: true,
    Delete_Days: '0',
  },
  GA_OptOutPlzDont: false,
  AutoGroupSeries: true,
  AutoGroupSeriesUseScoreAlgorithm: true,
  AutoGroupSeriesRelationExclusions: 'same setting|character',
} as SettingsServerType;

const serverSettingsSlice = createSlice({
  name: 'serverSettings',
  initialState,
  reducers: {
    saveServerSettings(sliceState, action: PayloadAction<Partial<SettingsServerType>>) {
      return Object.assign({}, sliceState, action.payload);
    },
  },
});

export const { saveServerSettings } = serverSettingsSlice.actions;

export default serverSettingsSlice.reducer;
