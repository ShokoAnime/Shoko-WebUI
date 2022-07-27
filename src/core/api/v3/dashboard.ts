import Api from '../index';

function ApiRequest(action: string, query?: string) {
  return Api.call({ action: `/v3/Dashboard/${action}`, ...query && { query } });
}

// Get the counters of various collection stats
function getDashboardStats() {
  return ApiRequest('Stats');
}

// Gets a breakdown of which types of anime the user has access to
function getDashboardSeriesSummary() {
  return ApiRequest('SeriesSummary');
}

// Get a list of recently added episodes (with additional details).
function getDashboardRecentlyAddedEpisodes(pageSize = 30, page = 1) {
  return ApiRequest('RecentlyAddedEpisodes', `?pageSize=${pageSize}&page=${page}`);
}

// Get a list of recently added series.
function getDashboardRecentlyAddedSeries(pageSize = 20, page = 1) {
  return ApiRequest('RecentlyAddedSeries', `?pageSize=${pageSize}&page=${page}`);
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
  getDashboardStats,
  getDashboardSeriesSummary,
  getDashboardRecentlyAddedEpisodes,
  getDashboardRecentlyAddedSeries,
  getDashboardContinueWatchingEpisodes,
  getDashboardNextUpEpisodes,
  getDashboardAniDBCalendar,
};
