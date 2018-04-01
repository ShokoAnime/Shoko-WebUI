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

export type SettingsServerType = SettingsDatabaseType & SettingsAnidbType & SettingsAnidbImagesType;

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
};

const server = handleAction(
  SETTINGS_SERVER,
  (state: SettingsServerType, action: Action): SettingsServerType =>
    Object.assign({}, state, action.payload),
  defaultState,
);

export default server;
