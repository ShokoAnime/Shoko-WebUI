const ANILIST_BASE_URL = 'https://anilist.co';

export const getAnilistAnimeLink = (anilistId: number | string) => `${ANILIST_BASE_URL}/anime/${anilistId}`;
