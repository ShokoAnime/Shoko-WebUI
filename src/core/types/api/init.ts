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

export type LegacyVersionType = Array<{
  Name: string;
  Version: string;
}>;

export type VersionType = {
  Server: {
    Version: string;
    ReleaseChannel: 'Stable' | 'Dev' | 'Debug';
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
    ReleaseChannel: 'Stable' | 'Dev' | 'Debug';
    Commit: string;
  };
};
