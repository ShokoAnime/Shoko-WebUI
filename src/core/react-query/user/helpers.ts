import type { ApiUserType, CommunitySitesType, UserType } from '@/core/types/api/user';

const simplifyCommunitySites = (sites: string[]) => {
  const result: CommunitySitesType = {
    AniDB: false,
    Trakt: false,
    Plex: false,
  };
  sites.forEach((site) => {
    result[site] = true;
  });
  return result;
};

export const transformUser = (response: ApiUserType): UserType => {
  const { CommunitySites, ...tempUser } = response;
  return { ...tempUser, CommunitySites: simplifyCommunitySites(CommunitySites) };
};

export const transformUsers = (response: ApiUserType[]): UserType[] => response.map(user => transformUser(user));
