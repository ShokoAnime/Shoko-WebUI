import Api from '../index';

function ApiRequest(action: string) {
  return Api.call({ action: `/v3/Episode/${action}` });
}

// Get an Episode by Shoko ID
function getEpisode(id: string) {
  return ApiRequest(id);
}

// Get the AniDB details for episode with Shoko ID
function getEpisodeAniDB(id: string) {
  return ApiRequest(`${id}/AniDB`);
}

// Get the TvDB details for episode with Shoko ID
function getEpisodeTvDB(id: string) {
  return ApiRequest(`${id}/TvDB`);
}

export default {
  getEpisode,
  getEpisodeAniDB,
  getEpisodeTvDB,
};
