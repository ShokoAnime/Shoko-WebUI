type BaseUserType = {
  ID: number;
  Username: string;
  IsAdmin: boolean;
  RestrictedTags: number[];
  Avatar: string;
  Password?: string;
  PlexUsernames: string;
};

export type CommunitySitesType = {
  AniDB: boolean;
  Trakt: boolean;
  Plex: boolean;
};

export type ApiUserType = BaseUserType & { CommunitySites: string[] };

export type UserType = BaseUserType & { CommunitySites: CommunitySitesType };
