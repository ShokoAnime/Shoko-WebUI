export type DefaultUserType = {
  Username: string;
  Password: string;
};

export type ServerStatusType = {
  StartupMessage: string;
  State: 1 | 2 | 3 | 4;
  Uptime: string;
};
