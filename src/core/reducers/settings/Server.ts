
import { handleAction } from 'redux-actions';
import { SETTINGS_SERVER } from '../../actions/settings/Server';
import { Action } from '../../actions';
import { mergeDeep } from '../../util';

export type SettingsDatabaseType = {
  MySqliteDirectory: string;
  DatabaseBackupDirectory: string;
  Type: string;
  Username: string;
  Password: string;
  Schema: string;
  Hostname: string;
  SQLite_DatabaseFile: string;
};

export type SettingsAnidbType = {
  Username: string;
  Password: string;
  AVDumpKey: string;
  ClientPort: number;
  AVDumpClientPort: number;
};

export type SettingsAnidbDownloadType = {
  DownloadCharacters: boolean;
  DownloadCreators: boolean;
  DownloadRelatedAnime: boolean;
  MaxRelationDepth: number;
};

// Delete, DeleteLocalOnly, MarkDeleted, MarkExternalStorage, MarkUnknown, MarkDisk
type MyListDeleteType = 0 | 1 | 2 | 3 | 4 | 5;
// Unknown, HDD, Disk, Deleted, Remote
type MyListStorageState = 0 | 1 | 2 | 3 | 4;

export type SettingsAnidbMylistType = {
  MyList_AddFiles: boolean;
  MyList_DeleteType: MyListDeleteType;
  MyList_ReadUnwatched: boolean;
  MyList_ReadWatched: boolean;
  MyList_SetUnwatched: boolean;
  MyList_SetWatched: boolean;
  MyList_StorageState: MyListStorageState;
};
// Never = 1, HoursSix = 2, HoursTwelve = 3, Daily = 4, WeekOne = 5, MonthOne = 6
export type SettingsUpdateFrequencyType = 1 | 2 | 3 | 4 | 5 | 6;

export type SettingsAnidbUpdateType = {
  Calendar_UpdateFrequency: SettingsUpdateFrequencyType;
  Anime_UpdateFrequency: SettingsUpdateFrequencyType;
  MyList_UpdateFrequency: SettingsUpdateFrequencyType;
  MyListStats_UpdateFrequency: SettingsUpdateFrequencyType;
  File_UpdateFrequency: SettingsUpdateFrequencyType;
};

export type SettingsTvdbDownloadType = {
  AutoFanart: boolean;
  AutoPosters: boolean;
  AutoWideBanners: boolean;
  AutoLink: boolean;
};

export type SettingsTvdbLanguageType = 'zh' | 'en' | 'sv' | 'no' | 'da' | 'fi' | 'nl' | 'de' | 'it' | 'es' | 'fr' | 'pl' | 'hu' | 'el' | 'tr' | 'ru' | 'he' | 'ja' | 'pt' | 'cs' | 'sl' | 'hr' | 'ko';

export type SettingsTvdbPrefsType = {
  AutoFanartAmount: number;
  AutoPostersAmount: number;
  AutoWideBannersAmount: number;
  Language: SettingsTvdbLanguageType;
  UpdateFrequency: SettingsUpdateFrequencyType;
};

export type SettingsTraktType = {
  Enabled: boolean;
  TokenExpirationDate: string;
  UpdateFrequency: SettingsUpdateFrequencyType;
  SyncFrequency: SettingsUpdateFrequencyType;
};

export type SettingsMoviedbType = {
  AutoFanart: boolean;
  AutoFanartAmount: number;
  AutoPosters: boolean;
  AutoPostersAmount: number;
};

export type SettingsPlexType = {
  Server: string;
  Libraries: string;
};

export type SettingsWebCacheType = {
  Address: string;
};

export type SettingsServerType = {
  AniDb: SettingsAnidbType & SettingsAnidbDownloadType
  & SettingsAnidbMylistType & SettingsAnidbUpdateType;
  Database: SettingsDatabaseType;
  WebCache: SettingsWebCacheType;
  TvDB: SettingsTvdbDownloadType & SettingsTvdbPrefsType;
  MovieDb: SettingsMoviedbType;
  TraktTv: SettingsTraktType;
  Plex: SettingsPlexType;
};
const defaultState = {
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
    MyList_DeleteType: 0 as MyListDeleteType,
    MyList_ReadUnwatched: false,
    MyList_ReadWatched: false,
    MyList_SetUnwatched: false,
    MyList_SetWatched: false,
    MyList_StorageState: 0 as MyListStorageState,
    Calendar_UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    Anime_UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    MyList_UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    MyListStats_UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    File_UpdateFrequency: 1 as SettingsUpdateFrequencyType,
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
    AutoLink: true,
    AutoFanart: true,
    AutoFanartAmount: 10,
    AutoWideBanners: true,
    AutoWideBannersAmount: 10,
    AutoPosters: true,
    AutoPostersAmount: 10,
    UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    Language: 'en' as SettingsTvdbLanguageType,
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
    UpdateFrequency: 1 as SettingsUpdateFrequencyType,
    SyncFrequency: 1 as SettingsUpdateFrequencyType,
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
  SETTINGS_SERVER, (state: SettingsServerType, action: Action): SettingsServerType =>
    mergeDeep({}, state, action.payload),
  defaultState,
);

export default server;
