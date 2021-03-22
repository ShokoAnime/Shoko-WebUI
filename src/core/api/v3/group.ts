import Api from '../index';

function ApiRequest(action: string, expectEmpty = true) {
  return Api.call({ action: `/v3/Group/${action}`, expectEmpty });
}

export function getRecreateAllGroups() {
  return ApiRequest('RecreateAllGroups');
}

export default {
  getRecreateAllGroups,
};
