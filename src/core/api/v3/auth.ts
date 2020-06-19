import Api from '../index';
import { ApiLoginType } from '../../types/api';

// Get an authentication token for the user.
function postAuth(params: ApiLoginType) {
  return Api.call({ action: '/auth', method: 'POST', params });
}

// Delete an APIKey from the database.
function deleteAuth() {
  return Api.call({ action: '/auth', method: 'DELETE' });
}

// Change the password. Invalidates the current user's apikeys. Reauth after using this!
function postChangePassword(newPassword: string) {
  return Api.call({
    action: '/auth/ChangePassword', method: 'POST', expectEmpty: true, params: { newPassword },
  });
}

export default {
  postAuth,
  deleteAuth,
  postChangePassword,
};
