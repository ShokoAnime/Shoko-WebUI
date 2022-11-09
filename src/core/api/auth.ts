import Api from './index';

// Change the password. Invalidates the current user's apikeys. Reauth after using this!
function postChangePassword(newPassword: string) {
  return Api.call({
    action: '/auth/ChangePassword', method: 'POST', expectEmpty: true, params: newPassword,
  });
}

export default {
  postChangePassword,
};
