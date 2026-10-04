/**
 * The plugin name to show next to a provider's name, or `null` when it would only repeat it (ignoring case and
 * surrounding whitespace).
 */
export const getDistinctPluginName = (providerName: string, pluginName?: string | null) => {
  const plugin = pluginName?.trim() ?? '';
  if (plugin === '' || plugin.toLowerCase() === providerName.trim().toLowerCase()) return null;
  return plugin;
};
