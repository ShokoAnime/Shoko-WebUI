import Api from '../index';

function ApiRequest(action: string) {
  return Api.call({ action: `/v3/Series/${action}` });
}

// Get a list of all series available to the current user
function getAllSeries() {
  return ApiRequest('');
}

// Get the series with ID
function getSeries(id: string) {
  return ApiRequest(id);
}

// Get AniDB Info for series with ID
function getSeriesAniDB(id:string) {
  return ApiRequest(`${id}/AniDB`);
}

// Get TvDB Info for series with ID
function getSeriesTvDB(id: string) {
  return ApiRequest(`${id}/TvDB`);
}

export default {
  getAllSeries,
  getSeries,
  getSeriesAniDB,
  getSeriesTvDB,
};
