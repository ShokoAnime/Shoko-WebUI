import Api from './index';

function getWebuiLatest(channel: 'stable' | 'unstable') {
  return Api.call({ action: '/webui/latest/', query: channel });
}

function getWebuiUpdate(channel: 'stable' | 'unstable') {
  return Api.call({ action: '/webui/update/', query: channel, expectEmpty: true });
}

export default {
  getWebuiLatest,
  getWebuiUpdate,
};
