import Api from '../index';
import type { SettingsAnidbLoginType } from '../../types/api/settings';

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

// Tests a Login with the given Credentials. This does not save the credentials.
function postAniDBTestLogin(params: SettingsAnidbLoginType) {
  return Api.call({
    action: '/v3/Settings/AniDB/TestLogin', method: 'POST', expectEmpty: true, params,
  });
}

export default {
  getSettings,
  patchSettings,
  postAniDBTestLogin,
};
