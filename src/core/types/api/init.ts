export type UserType = {
  Username: string;
  Password: string;
};

export type ServerStatusType = {
  StartupMessage: string;
  State: 'Starting' | 'Started' | 'Failed' | 'Waiting';
  CanShutdown?: boolean;
  CanRestart?: boolean;
  BootstrappedAt?: string;
  StartedAt?: string;
  Uptime?: string;
  StartupTime?: string;
  DatabaseBlocked?: {
    Blocked: boolean;
    Reason?: string;
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

/** Where a restart reason came from: changed settings, plugins to load or unload, or a plugin that asked. */
export type RestartReasonSourceValues = 'Configuration' | 'PluginState' | 'Plugin';

/** One reason the server needs a restart, from `GET Init/RestartReasons` or the `restart` feed. */
export type RestartReasonType = {
  Source: RestartReasonSourceValues;
  PluginID: string;
  /** The plugin's name, if it is still known. */
  PluginName: string | null;
  /** Stays the same while the reason stands, unique within its source and plugin. */
  Key: string;
  Description: string;
  RaisedAt: string;
};
