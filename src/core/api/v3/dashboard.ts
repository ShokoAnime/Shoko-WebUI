import Api from '../index';

function ApiRequest(action: string, query?: string) {
  return Api.call({ action: `/v3/Dashboard/${action}`, ...query && { query } });
}

// Get a list of the episodes to continue watching in recently watched order
function getDashboardContinueWatchingEpisodes(pageSize = 20, page = 1) {
  return ApiRequest('ContinueWatchingEpisodes', `?pageSize=${pageSize}&page=${page}`);
}

// Get the next episodes for series that currently don't have an active watch session for the user.
function getDashboardNextUpEpisodes(pageSize = 20, page = 1) {
  return ApiRequest('NextUpEpisodes', `?pageSize=${pageSize}&page=${page}`);
}

// Get a list of the episodes to continue watching (soon-to-be) in recently watched order
function getDashboardAniDBCalendar(showAll: boolean) {
  return ApiRequest('AniDBCalendar', `?showAll=${showAll ? 'true' : 'false'}`);
}

export default {
  getDashboardContinueWatchingEpisodes,
  getDashboardNextUpEpisodes,
  getDashboardAniDBCalendar,
};
