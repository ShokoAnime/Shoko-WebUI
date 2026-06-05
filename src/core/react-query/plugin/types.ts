// Mirrors `Shoko.Server.API.v3.Models.Common.IncludeOnlyFilter`. The server
// defaults each filter to `True`, which means "include everything"; `Only`
// keeps just matching entries and `False` excludes them.
export type PluginIncludeOnlyFilter = 'True' | 'False' | 'Only';

export type PluginListFilters = {
  query?: string;
  active?: PluginIncludeOnlyFilter;
  installed?: PluginIncludeOnlyFilter;
  enabled?: PluginIncludeOnlyFilter;
  restartPending?: PluginIncludeOnlyFilter;
  allVersions?: boolean;
};

export type UpdatePluginRequestType = {
  pluginId: string;
  isEnabled?: boolean;
  pluginVersion?: string;
};

export type DeletePluginRequestType = {
  pluginId: string;
  purgeConfiguration?: boolean;
  pluginVersion?: string;
};
