export type UserType = {
  Username: string;
  Password: string;
};

export type ServerStatusType = {
  StartupMessage: string;
  State: 'Starting' | 'Started' | 'Failed' | 'Waiting';
  Uptime: string;
  DatabaseBlocked: {
    Progress: number;
    Blocked: boolean;
    Status: string;
  };
};

export type ReleaseChannelValues = 'Auto' | 'Stable' | 'Dev';

export type ComponentVersionType = {
  Version: string;
  ReleaseChannel: ReleaseChannelValues | 'Debug';
  ReleaseDate: string;
  Commit?: string;
  Tag?: string;
  Description?: string;
};

export type VersionType = {
  Server: ComponentVersionType;
  Commons?: {
    Version: string;
  };
  Models?: {
    Version: string;
  };
  MediaInfo?: {
    Version: string | null;
  };
  WebUI?: ComponentVersionType;
};
