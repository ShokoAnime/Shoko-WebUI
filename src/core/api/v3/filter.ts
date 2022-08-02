import Api from '../index';

function ApiRequest(action: string) {
  return Api.call({ action: `/v3/Filter/${action}` });
}

function getFilters() {
  return ApiRequest('?pageSize=0');
}

export default {
  getFilters,
};