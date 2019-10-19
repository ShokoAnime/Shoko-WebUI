// @flow
import { handleAction } from 'redux-actions';
import { SETTINGS_SERVER } from '../../actions/settings/Server';
import type { Action } from '../../actions';
import { mergeDeep } from '../../util';

export type SettingBoolean = 'True' | 'False';

export type SettingsDatabaseType = {
  MySqliteDirectory: string,
  DatabaseBackupDirectory: string,
  Type: string,
  Username: string,
  Password: string,
  Schema: string,
  Hostname: string,
  SQLite_DatabaseFile: string,
}

export type SettingsAnidbType = {
  Username: string,
  Password: string,
  AVDumpKey: string,
  ClientPort: string,
  AVDumpClientPort: string,
}

export type SettingsAnidbDownloadType = {
  DownloadCharacters: boolean,
  DownloadCreators: boolean,
  DownloadRelatedAnime: boolean,
  MaxRelationDepth: 3,
}

export type SettingsAnidbMylistType = {
  MyList_AddFiles: SettingBoolean,
// Delete, DeleteLocalOnly, MarkDeleted, MarkExternalStorage, MarkUnknown, MarkDisk
  MyList_DeleteType: '0' | '1' | '2' | '3' | '4' | '5',
  MyList_ReadUnwatched: SettingBoolean,
  MyList_ReadWatched: SettingBoolean,
  MyList_SetUnwatched: SettingBoolean,
  MyList_SetWatched: SettingBoolean,
// Unknown, HDD, Disk, Deleted, Remote
  MyList_StorageState: '0' | '1' | '2' | '3' | '4',
}
// Never = 1, HoursSix = 2, HoursTwelve = 3, Daily = 4, WeekOne = 5, MonthOne = 6
export type SettingsUpdateFrequencyType = '1' | '2' | '3' | '4' | '5' | '6';

export type SettingsAnidbUpdateType = {
  Calendar_UpdateFrequency: SettingsUpdateFrequencyType,
  Anime_UpdateFrequency: SettingsUpdateFrequencyType,
  MyList_UpdateFrequency: SettingsUpdateFrequencyType,
  MyListStats_UpdateFrequency: SettingsUpdateFrequencyType,
  File_UpdateFrequency: SettingsUpdateFrequencyType
}

export type SettingsTvdbDownloadType = {
  AutoFanart: SettingBoolean,
  AutoPosters: SettingBoolean,
  AutoWideBanners: SettingBoolean,
  AutoLink: SettingBoolean,
}

export type SettingsTvdbLanguageType = 'zh' | 'en' | 'sv' | 'no' | 'da' | 'fi' | 'nl' | 'de' | 'it' | 'es' | 'fr' | 'pl' | 'hu' | 'el' | 'tr' | 'ru' | 'he' | 'ja' | 'pt' | 'cs' | 'sl' | 'hr' | 'ko';

export type SettingsTvdbPrefsType = {
  AutoFanartAmount: string,
  AutoPostersAmount: string,
  AutoWideBannersAmount: string,
  Language: SettingsTvdbLanguageType,
  UpdateFrequency: SettingsUpdateFrequencyType,
}

export type SettingsTraktType = {
  Enabled: SettingBoolean,
  TokenExpirationDate: string,
  UpdateFrequency: SettingsUpdateFrequencyType,
}

export type SettingsMoviedbType = {
  AutoFanart: SettingBoolean,
  AutoFanartAmount: string,
  AutoPosters: SettingBoolean,
  AutoPostersAmount: string,
}

export type SettingsPlexType = {
  Server: string,
  Libraries: string,
}

export type SettingsWebCacheType = {
  Address: string,
}

export type SettingsServerType = {
  AniDb: SettingsAnidbType & SettingsAnidbDownloadType & SettingsAnidbMylistType
    & SettingsAnidbUpdateType,
  Database: SettingsDatabaseType,
  WebCache: SettingsWebCacheType,
  TvDB: SettingsTvdbDownloadType & SettingsTvdbPrefsType,
  MovieDb: SettingsMoviedbType,
  TraktTv: SettingsTraktType,
  Plex: SettingsPlexType,
}
const defaultState = {
  AniDb: {
    Username: '',
    Password: '',
    AVDumpKey: '',
    ClientPort: '',
    AVDumpClientPort: '',
    DownloadCharacters: false,
    DownloadCreators: false,
    DownloadRelatedAnime: true,
    MaxRelationDepth: 3,
    MyList_AddFiles: 'False',
    MyList_DeleteType: '0',
    MyList_ReadUnwatched: 'False',
    MyList_ReadWatched: 'False',
    MyList_SetUnwatched: 'False',
    MyList_SetWatched: 'False',
    MyList_StorageState: '0',
    Calendar_UpdateFrequency: '1',
    Anime_UpdateFrequency: '1',
    MyList_UpdateFrequency: '1',
    MyListStats_UpdateFrequency: '1',
    File_UpdateFrequency: '1',
  },
  Database: {
    MySqliteDirectory: '',
    DatabaseBackupDirectory: '',
    Type: '',
    Username: '',
    Password: '',
    Schema: '',
    Hostname: '',
    SQLite_DatabaseFile: '',
  },
  WebCache: {
    Address: '127.0.0.1',
  },
  TvDB: {
    AutoLink: 'True',
    AutoFanart: 'True',
    AutoFanartAmount: '10',
    AutoWideBanners: 'True',
    AutoWideBannersAmount: '10',
    AutoPosters: 'True',
    AutoPostersAmount: '10',
    UpdateFrequency: '1',
    Language: 'en',
  },
  MovieDb: {
    AutoFanart: 'True',
    AutoFanartAmount: '10',
    AutoPosters: 'True',
    AutoPostersAmount: '10',
  },
  TraktTv: {
    Enabled: 'False',
    TokenExpirationDate: '',
    UpdateFrequency: '1',
    SyncFrequency: '1',
  },
  Import: {
    VideoExtensions: [],
    DefaultSeriesLanguage: 1,
    DefaultEpisodeLanguage: 1,
    UseExistingFileWatchedStatus: true,
  },
  Plex: {
    Server: '',
    Libraries: '',
  },
};

const server = handleAction(
  SETTINGS_SERVER,
  (state: SettingsServerType, action: Action): SettingsServerType =>
    mergeDeep({}, state, action.payload),
  defaultState,
);

export default server;
