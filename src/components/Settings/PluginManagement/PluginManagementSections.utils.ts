export const pluginManagementSections = [
  { label: 'Installed', value: 'installed' },
  { label: 'Browse', value: 'browse' },
  { label: 'Updates', value: 'updates' },
  { label: 'Repositories', value: 'repositories' },
] as const;

export type PluginManagementSectionType = typeof pluginManagementSections[number]['value'];

export const isPluginManagementSection = (section?: string): section is PluginManagementSectionType =>
  !!section && pluginManagementSections.some(item => item.value === section);
