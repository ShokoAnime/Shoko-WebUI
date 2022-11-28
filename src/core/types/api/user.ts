type BaseUserType = {
  ID: number;
  Username: string;
  IsAdmin: boolean;
  RestrictedTags: Array<number>;
};

export type CommunitySitesType = {
  AniDB: boolean;
  Trakt: boolean;
  Plex: boolean;
};

export type ApiUserType = BaseUserType & { CommunitySites: Array<string> };

export type UserType = BaseUserType & { CommunitySites: CommunitySitesType };
