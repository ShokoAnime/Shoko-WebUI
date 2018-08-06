// @flow
import { handleAction } from 'redux-actions';
import { SETTINGS_SERVER } from '../../actions/settings/Server';
import type { Action } from '../../actions';

export type SettingBoolean = 'True' | 'False';

export type SettingsDatabaseType = {
  SQLite_DatabaseFile: string,
  MySQL_Hostname: string,
  MySQL_SchemaName: string,
  MySQL_Username: string,
  MySQL_Password: string,
  SQLServer_DatabaseName: string,
  SQLServer_DatabaseServer: string,
  SQLServer_Username: string,
  SQLServer_Password: string,
}

export type SettingsAnidbType = {
  AniDB_Username: string,
  AniDB_Password: string,
  AniDB_AVDumpKey: string,
  AniDB_ClientPort: string,
  AniDB_AVDumpClientPort: string,
}

export type SettingsAnidbImagesType = {
  AniDB_DownloadCharacters: SettingBoolean,
  AniDB_DownloadCreators: SettingBoolean,
  AniDB_DownloadReviews: SettingBoolean,
  AniDB_DownloadReleaseGroups: SettingBoolean,
}

export type SettingsAnidbMylistType = {
  AniDB_MyList_AddFiles: SettingBoolean,
// Delete, DeleteLocalOnly, MarkDeleted, MarkExternalStorage, MarkUnknown, MarkDisk
  AniDB_MyList_DeleteType: '0' | '1' | '2' | '3' | '4' | '5',
  AniDB_MyList_ReadUnwatched: SettingBoolean,
  AniDB_MyList_ReadWatched: SettingBoolean,
  AniDB_MyList_SetUnwatched: SettingBoolean,
  AniDB_MyList_SetWatched: SettingBoolean,
// Unknown, HDD, Disk, Deleted, Remote
  AniDB_MyList_StorageState: '0' | '1' | '2' | '3' | '4',
}
// Never = 1, HoursSix = 2, HoursTwelve = 3, Daily = 4, WeekOne = 5, MonthOne = 6
export type SettingsUpdateFrequencyType = '1' | '2' | '3' | '4' | '5' | '6';

export type SettingsAnidbUpdateType = {
  AniDB_Calendar_UpdateFrequency: SettingsUpdateFrequencyType,
  AniDB_Anime_UpdateFrequency: SettingsUpdateFrequencyType,
  AniDB_MyList_UpdateFrequency: SettingsUpdateFrequencyType,
  AniDB_MyListStats_UpdateFrequency: SettingsUpdateFrequencyType,
  AniDB_File_UpdateFrequency: SettingsUpdateFrequencyType
}

export type SettingsTvdbDownloadType = {
  TvDB_AutoFanart: SettingBoolean,
  TvDB_AutoPosters: SettingBoolean,
  TvDB_AutoWideBanners: SettingBoolean,
  TvDB_AutoLink: SettingBoolean,
}

export type SettingsTvdbLanguageType = 'zh' | 'en' | 'sv' | 'no' | 'da' | 'fi' | 'nl' | 'de' | 'it' | 'es' | 'fr' | 'pl' | 'hu' | 'el' | 'tr' | 'ru' | 'he' | 'ja' | 'pt' | 'cs' | 'sl' | 'hr' | 'ko';

export type SettingsTvdbPrefsType = {
  TvDB_AutoFanartAmount: string,
  TvDB_AutoPostersAmount: string,
  TvDB_AutoWideBannersAmount: string,
  TvDB_Language: SettingsTvdbLanguageType,
  TvDB_UpdateFrequency: SettingsUpdateFrequencyType,
}

export type SettingsTraktType = {
  Trakt_IsEnabled: SettingBoolean,
  Trakt_TokenExpirationDate: string,
  Trakt_UpdateFrequency: SettingsUpdateFrequencyType,
}

export type SettingsMalType = {
  MAL_AutoLink: SettingBoolean,
  MAL_NeverDecreaseWatchedNums: SettingBoolean,
  MAL_Password: string,
  MAL_Username: string,
  MAL_UpdateFrequency: SettingsUpdateFrequencyType,
}

export type SettingsMoviedbType = {
  MovieDB_AutoFanart: SettingBoolean,
  MovieDB_AutoFanartAmount: string,
  MovieDB_AutoPosters: SettingBoolean,
  MovieDB_AutoPostersAmount: string,
}

export type SettingsPlexType = {
  Plex_Server: string,
  Plex_Libraries: string,
}

export type SettingsServerType = SettingsDatabaseType & SettingsAnidbType & SettingsAnidbImagesType
  & SettingsAnidbMylistType & SettingsAnidbUpdateType & SettingsTvdbDownloadType
  & SettingsTvdbPrefsType & SettingsTraktType & SettingsMalType & SettingsMoviedbType
  & SettingsPlexType;

const defaultState = {
  AniDB_Username: '',
  AniDB_Password: '',
  AniDB_AVDumpKey: '',
  AniDB_ClientPort: '',
  AniDB_AVDumpClientPort: '',
  SQLite_DatabaseFile: '',
  MySQL_Hostname: '',
  MySQL_SchemaName: '',
  MySQL_Username: '',
  MySQL_Password: '',
  SQLServer_DatabaseName: '',
  SQLServer_DatabaseServer: '',
  SQLServer_Username: '',
  SQLServer_Password: '',
  AniDB_DownloadCharacters: 'False',
  AniDB_DownloadCreators: 'False',
  AniDB_DownloadReviews: 'False',
  AniDB_DownloadReleaseGroups: 'False',
  AniDB_MyList_AddFiles: 'False',
  AniDB_MyList_DeleteType: '0',
  AniDB_MyList_ReadUnwatched: 'False',
  AniDB_MyList_ReadWatched: 'False',
  AniDB_MyList_SetUnwatched: 'False',
  AniDB_MyList_SetWatched: 'False',
  AniDB_MyList_StorageState: '0',
  AniDB_Calendar_UpdateFrequency: '1',
  AniDB_Anime_UpdateFrequency: '1',
  AniDB_MyList_UpdateFrequency: '1',
  AniDB_MyListStats_UpdateFrequency: '1',
  AniDB_File_UpdateFrequency: '1',
  TvDB_AutoFanart: 'True',
  TvDB_AutoPosters: 'True',
  TvDB_AutoWideBanners: 'True',
  TvDB_AutoLink: 'True',
  TvDB_AutoFanartAmount: '10',
  TvDB_AutoPostersAmount: '10',
  TvDB_AutoWideBannersAmount: '10',
  TvDB_Language: 'en',
  TvDB_UpdateFrequency: '1',
  Trakt_IsEnabled: 'False',
  Trakt_TokenExpirationDate: '',
  Trakt_UpdateFrequency: '1',
  MAL_AutoLink: 'False',
  MAL_NeverDecreaseWatchedNums: 'True',
  MAL_Password: '',
  MAL_UpdateFrequency: '4',
  MAL_Username: '',
  MovieDB_AutoFanart: 'True',
  MovieDB_AutoFanartAmount: '10',
  MovieDB_AutoPosters: 'True',
  MovieDB_AutoPostersAmount: '10',
  Plex_Server: '',
  Plex_Libraries: '',
};

const server = handleAction(
  SETTINGS_SERVER,
  (state: SettingsServerType, action: Action): SettingsServerType =>
    Object.assign({}, state, action.payload),
  defaultState,
);

export default server;
