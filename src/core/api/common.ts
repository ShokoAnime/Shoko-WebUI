
import Api from './index';
import { ApiLoginType } from '../types/api';

function* getLogDelta(data: {delta: number;position: number;}): {} {
  const query = data ? `${data.delta}/${data.position || 0}` : '';
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

function getQueueHasherPause() {
  return Api.call({ action: '/queue/hasher/pause', expectEmpty: true });
}

function getQueueHasherStart() {
  return Api.call({ action: '/queue/hasher/start', expectEmpty: true });
}

function getQueueHasherClear() {
  return Api.call({ action: '/queue/hasher/clear', expectEmpty: true });
}

function getQueueGeneralPause() {
  return Api.call({ action: '/queue/general/pause', expectEmpty: true });
}

function getQueueGeneralStart() {
  return Api.call({ action: '/queue/general/start', expectEmpty: true });
}

function getQueueGeneralClear() {
  return Api.call({ action: '/queue/general/clear', expectEmpty: true });
}

function getQueueImagesPause() {
  return Api.call({ action: '/queue/images/pause', expectEmpty: true });
}

function getQueueImagesStart() {
  return Api.call({ action: '/queue/images/start', expectEmpty: true });
}

function getQueueImagesClear() {
  return Api.call({ action: '/queue/images/clear', expectEmpty: true });
}

function getFileRecent() {
  return Api.call({ action: '/file/recent' });
}

function getFileAniDB(id: string) {
  return Api.call({ action: `/v3/File/${id}/AniDB` });
}

function getFile(id: string) {
  return Api.call({ action: `/v3/File/${id}` });
}

function getImportFolder() {
  return Api.call({ action: '/v3/ImportFolder' });
}

function getDashboardStats() {
  return Api.call({ action: '/v3/Dashboard/Stats' });
}

function getDashboardSeriesSummary() {
  return Api.call({ action: '/v3/Dashboard/SeriesSummary' });
}

function newsGet() {
  return Api.call({ action: '/news/get', query: '?max=5' });
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

function postFolderAdd(params: {}) {
  return Api.call({ action: '/folder/add', method: 'POST', params });
}

function postFolderEdit(params: {}) {
  return Api.call({ action: '/folder/edit', method: 'POST', params });
}

function postWebuiConfig(params: {}) {
  return Api.call({ action: '/webui/config', method: 'POST', params });
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

function postOsFolder(path) {
  return Api.call({ action: '/os/folder', method: 'POST', params: { dir: path, full_path: path } });
}

function patchConfigSet(params: {}) {
  return Api.call({
    action: '/v3/Settings', method: 'PATCH', expectEmpty: true, params,
  });
}

function getTraktCode() {
  return Api.call({ action: '/trakt/code' });
}

function postAuth(params: ApiLoginType) {
  return Api.call({ action: '/auth', method: 'POST', params });
}

function getJMMUserID() {
  return Api.call({ action: '/myid/get' });
}

function postChangePassword(params: {}) {
  return Api.call({ action: '/user/password', method: 'POST', params });
}

function getEp(id: string) {
  return Api.call({ action: '/ep', query: `?id=${id}` });
}

function getSerie(id: string) {
  return Api.call({ action: '/serie', query: `?id=${id}` });
}


export default {
  getLogDelta,
  getWebuiConfig,
  queueStatus,
  getQueueHasherPause,
  getQueueHasherStart,
  getQueueHasherClear,
  getQueueGeneralPause,
  getQueueGeneralStart,
  getQueueGeneralClear,
  getQueueImagesPause,
  getQueueImagesStart,
  getQueueImagesClear,
  getFileRecent,
  getFileAniDB,
  getFile,
  getImportFolder,
  getDashboardStats,
  getDashboardSeriesSummary,
  newsGet,
  webuiLatest,
  configExport,
  configImport,
  getLogRotate,
  postLogRotate,
  postFolderAdd,
  postFolderEdit,
  postWebuiConfig,
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
  patchConfigSet,
  getTraktCode,
  postAuth,
  getJMMUserID,
  postChangePassword,
  getEp,
  getSerie,
};
