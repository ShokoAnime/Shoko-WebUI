export type UserType = {
  Username: string;
  Password: string;
};

export type ServerStatusType = {
  StartupMessage: string;
  State: 1 | 2 | 3 | 4;
  Uptime: string;
  DatabaseBlocked: {
    Progress: number;
    Blocked: boolean;
    Status: string;
  };
};

export type VersionType = {
  Server: {
    Version: string;
    Channel: ReleaseChannel;
    Commit?: string;
    Tag?: string;
  };
  Commons?: {
    Version: string;
  };
  Models?: {
    Version: string;
  };
  MediaInfo?: {
    Version: string | null;
  };
  WebUI?: {
    Version: string;
    Channel: ReleaseChannel;
    Commit: string;
  };
};

export const enum ReleaseChannel {
  Stable = 'Stable',
  Dev = 'Dev',
  Debug = 'Debug',
}
