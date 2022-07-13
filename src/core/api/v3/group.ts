import Api, { buildQuery } from '../index';

function ApiRequest(action: string, query?: string, expectEmpty = false) {
  return Api.call({ action: `/v3/Group/${action}`, expectEmpty, ...query && { query } });
}

export function getRecreateAllGroups() {
  return ApiRequest('RecreateAllGroups', '', true);
}

export function getGroup(page:number = 0, pageSize:number = 50, topLevelOnly:boolean = false) {
  const params = { page, pageSize, topLevelOnly };
  return ApiRequest('', buildQuery(params));
}

export default {
  getRecreateAllGroups,
  getGroup,
};
