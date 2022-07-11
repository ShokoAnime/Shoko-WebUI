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

// Get a list of the episodes to continue watching (soon-to-be) in recently watched order
function getDashboardContinueWatchingEpisodes() {
  return ApiRequest('ContinueWatchingEpisodes');
}

// Get a list of the episodes to continue watching (soon-to-be) in recently watched order
function getDashboardAniDBCalendar() {
  return ApiRequest('AniDBCalendar', '?showAll=true');
}

export default {
  getDashboardStats,
  getDashboardSeriesSummary,
  getDashboardContinueWatchingEpisodes,
  getDashboardAniDBCalendar,
};
