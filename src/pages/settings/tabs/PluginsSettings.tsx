import React, { useMemo, useState } from 'react';
import { mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useDebounceValue } from 'usehooks-ts';

import Input from '@/components/Input/Input';
import MultiStateButton from '@/components/Input/MultiStateButton';
import CatalogPanel from '@/components/Settings/PluginManagement/CatalogPanel';
import InstalledPluginsPanel from '@/components/Settings/PluginManagement/InstalledPluginsPanel';
import PluginUpdatesPanel from '@/components/Settings/PluginManagement/PluginUpdatesPanel';
import RepositoryPanel from '@/components/Settings/PluginManagement/RepositoryPanel';
import { usePluginsQuery } from '@/core/react-query/plugin/queries';
import {
  getPluginUpdates,
  groupInstalledPlugins,
  groupPluginPackages,
} from '@/core/react-query/plugin-package/helpers';
import { usePluginPackagesQuery } from '@/core/react-query/plugin-package/queries';

const sections = [
  { label: 'Repositories', value: 'repositories' },
  { label: 'Browse', value: 'browse' },
  { label: 'Installed', value: 'installed' },
  { label: 'Updates', value: 'updates' },
];

const PluginsSettings = () => {
  const [section, setSection] = useState('repositories');
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, 300);

  const packagesQuery = usePluginPackagesQuery({
    allowSync: false,
    onlyCompatible: false,
    onlyLatest: false,
    pageSize: 0,
    query: debouncedQuery || undefined,
  });
  const pluginsQuery = usePluginsQuery({ allVersions: true, query: debouncedQuery || undefined });
  const updatePackagesQuery = usePluginPackagesQuery({
    allowSync: false,
    onlyCompatible: false,
    onlyLatest: false,
    pageSize: 0,
  });

  const groupedPackages = useMemo(
    () => groupPluginPackages(packagesQuery.data?.List ?? []),
    [packagesQuery.data?.List],
  );
  const groupedPlugins = useMemo(
    () => groupInstalledPlugins(pluginsQuery.data ?? []),
    [pluginsQuery.data],
  );
  const updateEntries = useMemo(
    () => groupPluginPackages(updatePackagesQuery.data?.List ?? []),
    [updatePackagesQuery.data?.List],
  );
  const pluginUpdates = useMemo(
    () => getPluginUpdates(updateEntries),
    [updateEntries],
  );
  const filteredPluginUpdates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) return pluginUpdates;

    return pluginUpdates.filter(
      update =>
        update.Name.toLocaleLowerCase().includes(normalizedQuery) || update.CurrentVersion.includes(normalizedQuery)
        || update.LatestVersion.includes(normalizedQuery),
    );
  }, [pluginUpdates, query]);
  const filteredUpdateEntries = useMemo(() => {
    const matchingPackageIds = new Set(filteredPluginUpdates.map(update => update.PackageID));

    return updateEntries.filter(entry => matchingPackageIds.has(entry.PackageID));
  }, [filteredPluginUpdates, updateEntries]);

  const isLoading = !packagesQuery.data || !pluginsQuery.data;
  const updatesLoading = !updatePackagesQuery.data;

  return (
    <>
      <title>Settings &gt; Plugins | Shoko</title>
      <div className="flex flex-col gap-y-1 sm:gap-y-2">
        <div className="text-xl font-semibold">Plugins</div>
        <div className="max-w-3xl">
          Manage plugin repositories, browse plugin packages, review installed plugins, and manually apply updates.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <MultiStateButton
        activeState={section}
        onStateChange={setSection}
        states={sections}
      />

      <Input
        id="plugin-search"
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Search plugins and repositories"
        startIcon={mdiMagnify}
      />

      {isLoading
        ? (
          <div className="flex grow items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} spin size={4} />
          </div>
        )
        : (
          <>
            {section === 'repositories' && <RepositoryPanel query={query} />}
            {section === 'browse' && <CatalogPanel entries={groupedPackages} />}
            {section === 'installed' && (
              <InstalledPluginsPanel groupedPackages={groupedPackages} groupedPlugins={groupedPlugins} />
            )}
            {section === 'updates' && (
              <PluginUpdatesPanel
                entries={filteredUpdateEntries}
                isLoading={updatesLoading}
                updates={filteredPluginUpdates}
              />
            )}
          </>
        )}
    </>
  );
};

export default PluginsSettings;
