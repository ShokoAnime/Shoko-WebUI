export type ChangePasswordRequestType = {
  Password: string;
  RevokeAPIKeys: boolean;
  userId?: number;
};
