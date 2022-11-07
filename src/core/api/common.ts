import Api from './index';

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

export default {
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
};
