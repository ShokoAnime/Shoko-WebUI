const ANIDB_BASE_URL = 'https://anidb.net';

export const getAnidbAnimeLink = (anidbId: number | string) => `${ANIDB_BASE_URL}/anime/${anidbId}`;
export const getAnidbEpisodeLink = (anidbId: number | string) => `${ANIDB_BASE_URL}/episode/${anidbId}`;
export const getAnidbGroupLink = (groupId: number | string, anidbAnimeId: number | string) =>
  `${ANIDB_BASE_URL}/group/${groupId}/anime/${anidbAnimeId}`;
export const getAnidbTagLink = (tagId: number | string) => `${ANIDB_BASE_URL}/tag/${tagId}`;
export const isAnidbFileUri = (uri?: string | null): uri is string =>
  uri?.startsWith(`${ANIDB_BASE_URL}/file/`) ?? false;
