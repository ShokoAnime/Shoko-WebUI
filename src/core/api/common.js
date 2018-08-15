// @flow
import Api from './index';
import type { SettingType } from '../sagas/settings';
import type { ApiLoginType } from '../types/api';

function* getLogDelta(data: {delta: number, position: number}): {} {
  const query = data ? `${data.delta}/${data.position}` : '';
  const json = yield Api.call({ action: '/log/get/', query });
  if (json.error && json.code === 404) {
    return { data: [] };
  }
  return json;
}

function getWebuiConfig() {
  return Api.call({ action: '/webui/config' });
}

function getVersion() {
  return Api.call({ action: '/version' });
}

function queueStatus() {
  return Api.call({ action: '/queue/get' });
}

function fileRecent() {
  return Api.call({ action: '/file/recent' });
}

function folderList() {
  return Api.call({ action: '/folder/list' });
}

function serieCount() {
  return Api.call({ action: '/serie/count' });
}

function fileCount() {
  return Api.call({ action: '/file/count' });
}

function newsGet() {
  return Api.call({ action: '/news/get' });
}

function webuiLatest(channel: 'stable' | 'unstable') {
  return Api.call({ action: '/webui/latest/', query: channel });
}

function configExport() {
  return Api.call({ action: '/config/export' });
}

function configImport(value: {}) {
  return Api.call({ action: '/config/import', method: 'POST', params: value });
}

function getLogRotate() {
  return Api.call({ action: '/log/rotate' });
}

function postLogRotate(params: {}) {
  return Api.call({ action: '/log/rotate', method: 'POST', params });
}

function getRescan() {
  return Api.call({ action: '/rescan' });
}

function getRemoveMissingFiles() {
  return Api.call({ action: '/remove_missing_files' });
}

function getStatsUpdate() {
  return Api.call({ action: '/stats_update' });
}

function getMediainfoUpdate() {
  return Api.call({ action: '/mediainfo_update' });
}

function getFolderList() {
  return Api.call({ action: '/folder/list' });
}

function getFolderImport() {
  return Api.call({ action: '/folder/import' });
}

function postFolderAdd(params: {}) {
  return Api.call({ action: '/folder/add', method: 'POST', params });
}

function postFolderEdit(params: {}) {
  return Api.call({ action: '/folder/edit', method: 'POST', params });
}

function postWebuiConfig(params: {}) {
  return Api.call({ action: '/webui/config', method: 'POST', params });
}

function getPlexSync() {
  return Api.call({ action: '/sync/all', endpoint: '/plex' });
}

function getPlexLoginurl() {
  return Api.call({ action: '/loginurl', endpoint: '/plex' });
}

function getInit(data: string) {
  return Api.call({ action: '/init/', query: data });
}

function getInitDatabase() {
  return Api.call({ action: '/init/database' });
}

function postInitDatabase(params: {}) {
  return Api.call({ action: '/init/database', method: 'POST', params });
}

function getInitDatabaseTest() {
  return Api.call({ action: '/init/database/test' });
}

function getInitStartserver() {
  return Api.call({ action: '/init/startserver' });
}

function getInitAnidb() {
  return Api.call({ action: '/init/anidb' });
}

function postInitAnidb(params: {}) {
  return Api.call({ action: '/init/anidb', method: 'POST', params });
}

function getInitAnidbTest() {
  return Api.call({ action: '/init/anidb/test' });
}

function getInitDefaultuser() {
  return Api.call({ action: '/init/defaultuser' });
}

function postInitDefaultuser(params: {}) {
  return Api.call({ action: '/init/defaultuser', method: 'POST', params });
}

function getInitDatabaseSqlserverinstance() {
  return Api.call({ action: '/init/database/sqlserverinstance' });
}

function getWebuiUpdate(channel: string) {
  return Api.call({ action: '/webui/update/', query: channel });
}

function getSerieInfobyfolder(data: string) {
  return Api.call({ action: '/serie/infobyfolder', query: data });
}

function getOsDrives() {
  return Api.call({ action: '/os/drives' });
}

function postOsFolder(params: {}) {
  return Api.call({ action: '/os/folder', method: 'POST', params });
}

function postConfigSet(params: Array<SettingType>) {
  return Api.call({ action: '/config/set', method: 'POST', params });
}

function getTraktCode() {
  return Api.call({ action: '/trakt/code' });
}

function postAuth(params: ApiLoginType) {
  return Api.call({ action: '/auth', method: 'POST', params });
}

export default {
  getLogDelta,
  getWebuiConfig,
  queueStatus,
  fileRecent,
  folderList,
  serieCount,
  fileCount,
  newsGet,
  webuiLatest,
  configExport,
  configImport,
  getLogRotate,
  postLogRotate,
  getRescan,
  getRemoveMissingFiles,
  getStatsUpdate,
  getMediainfoUpdate,
  getFolderList,
  postFolderAdd,
  postFolderEdit,
  postWebuiConfig,
  getFolderImport,
  getPlexSync,
  getPlexLoginurl,
  getInit,
  getInitDatabase,
  postInitDatabase,
  getInitDatabaseTest,
  getInitStartserver,
  getInitAnidb,
  postInitAnidb,
  getInitAnidbTest,
  getInitDefaultuser,
  postInitDefaultuser,
  getInitDatabaseSqlserverinstance,
  getVersion,
  getWebuiUpdate,
  getSerieInfobyfolder,
  getOsDrives,
  postOsFolder,
  postConfigSet,
  getTraktCode,
  postAuth,
};
