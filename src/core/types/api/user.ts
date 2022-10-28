export type UserType = {
  ID: number;
  Username: string;
  IsAdmin: boolean;
  CommunitySites: Array<string>;
  TagBlacklist: Array<string>;
};
