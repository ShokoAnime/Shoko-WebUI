import Api from '../index';

// Get all settings
function getSettings() {
  return Api.call({ action: '/v3/Settings' });
}

// JsonPatch the settings
function patchSettings(params: {}) {
  return Api.call({
    action: '/v3/Settings', method: 'PATCH', expectEmpty: true, params,
  });
}

export default {
  getSettings,
  patchSettings,
};
