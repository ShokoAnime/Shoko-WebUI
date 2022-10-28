import Api from './index';

function* getLogDelta(data: { delta: number;position: number; }): {} {
  const query = data ? `${data.delta}/${data.position || 0}` : '';
  const json = yield Api.call({ action: '/log/get/', query });
  if (json.error && json.code === 404) {
    return { data: [] };
  }
  return json;
}

function getVersion() {
  return Api.call({ action: '/version' });
}

function getQueue() {
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

function getQueuePause() {
  return Api.call({ action: '/queue/pause', expectEmpty: true });
}

function getQueueStart() {
  return Api.call({ action: '/queue/start', expectEmpty: true });
}

function getLogRotate() {
  return Api.call({ action: '/log/rotate' });
}

function postLogRotate(params: {}) {
  return Api.call({ action: '/log/rotate', method: 'POST', params });
}

export default {
  getLogDelta,
  getQueue,
  getQueueHasherPause,
  getQueueHasherStart,
  getQueueHasherClear,
  getQueueGeneralPause,
  getQueueGeneralStart,
  getQueueGeneralClear,
  getQueueImagesPause,
  getQueueImagesStart,
  getQueueImagesClear,
  getQueuePause,
  getQueueStart,
  getLogRotate,
  postLogRotate,
  getVersion,
};
