import React, { useEffect, useMemo, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import InstalledPluginVersions from '@/components/Settings/PluginManagement/InstalledPluginVersions';
import { usePluginsQuery } from '@/core/react-query/plugin/queries';
import {
  getManageablePlugins,
  getUpdateRelease,
  groupInstalledPlugins,
  groupPluginPackages,
  sortInstalledPluginGroups,
} from '@/core/react-query/plugin-package/helpers';
import { usePluginPackagesQuery } from '@/core/react-query/plugin-package/queries';

import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';

type Props = {
  query: string;
};

type SelectedUpgradeType = {
  currentVersion: string;
  packageId: string;
  release: PluginPackageCatalogEntryType['Releases'][number];
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => (
  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${className ?? ''}`.trim()}>
    {children}
  </span>
);

const releaseMatchesPlugin = (
  release: PluginPackageCatalogEntryType['Releases'][number],
  plugin: PluginInfoType,
) =>
  release.Version === plugin.Version
  && (
    (!!plugin.SourceRevision && release.SourceRevision === plugin.SourceRevision)
    || (!!plugin.ReleaseTag && release.Tag === plugin.ReleaseTag)
    || (!plugin.SourceRevision && !plugin.ReleaseTag)
  );

const findPackageEntryForPluginGroup = (
  entries: PluginPackageCatalogEntryType[],
  pluginId: string,
  plugins: PluginInfoType[],
) => {
  const directMatch = entries.find(entry => entry.InstalledPlugins.some(plugin => plugin.ID === pluginId));
  if (directMatch) return directMatch;

  return entries.find((entry) => {
    const hasMatchingPlugin = plugins.some((plugin) => {
      if (entry.InstalledPlugins.some(installedPlugin => installedPlugin.ID === plugin.ID)) return true;
      if (entry.Name !== plugin.Name) return false;

      return entry.Releases.some(release => releaseMatchesPlugin(release, plugin));
    });

    return hasMatchingPlugin;
  });
};

const InstalledPluginsPanel = ({ query }: Props) => {
  const [expandedPluginId, setExpandedPluginId] = useState<string>();
  const [failedThumbnailUrls, setFailedThumbnailUrls] = useState<Record<string, boolean>>({});
  const [selectedUpgrade, setSelectedUpgrade] = useState<SelectedUpgradeType>();
  const packagesQuery = usePluginPackagesQuery({
    allowSync: false,
    onlyCompatible: false,
    onlyLatest: false,
    pageSize: 0,
    query: query || undefined,
  });
  const pluginsQuery = usePluginsQuery({ allVersions: true, query: query || undefined });
  const groupedPackages = useMemo(
    () => groupPluginPackages(packagesQuery.data?.List ?? []),
    [packagesQuery.data?.List],
  );
  const groupedPlugins = useMemo(
    () => groupInstalledPlugins(getManageablePlugins(pluginsQuery.data ?? [])),
    [pluginsQuery.data],
  );

  const pluginGroups = useMemo(
    () => sortInstalledPluginGroups(groupedPlugins, groupedPackages),
    [groupedPackages, groupedPlugins],
  );
  const selectedEntry = groupedPackages.find(entry => entry.PackageID === selectedUpgrade?.packageId);
  const retryInstalled = () => {
    if (packagesQuery.isError) packagesQuery.refetch().catch(console.error);
    if (pluginsQuery.isError) pluginsQuery.refetch().catch(console.error);
  };

  useEffect(() => {
    setFailedThumbnailUrls({});
  }, [pluginGroups]);

  if (packagesQuery.isPending || pluginsQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  if (packagesQuery.isError || pluginsQuery.isError) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Installed plugins unavailable</div>
        <div className="mt-2 opacity-80">
          Installed plugin data could not be loaded. Retry to refresh the installed plugins view.
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={retryInstalled}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (pluginGroups.length === 0) {
    return <div className="rounded-lg border border-panel-border bg-panel-input p-6">No installed plugins found.</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {pluginGroups.map(([pluginId, plugins]) => {
        const plugin = plugins[0];
        const matchingEntry = findPackageEntryForPluginGroup(groupedPackages, pluginId, plugins);
        const thumbnailPlugin = plugins.find(item => item.Thumbnail);
        const thumbnailCandidates = [
          matchingEntry?.Thumbnail ? `/api/v3/Plugin/Package/${matchingEntry.PackageID}/Thumbnail` : undefined,
          matchingEntry?.InstalledPlugins[0]?.Thumbnail
            ? `/api/v3/Plugin/${matchingEntry.InstalledPlugins[0].ID}/Thumbnail`
            : undefined,
          thumbnailPlugin?.Thumbnail ? `/api/v3/Plugin/${thumbnailPlugin.ID}/Thumbnail` : undefined,
        ].filter(candidate => !!candidate && !failedThumbnailUrls[candidate]);
        const thumbnailUrl = thumbnailCandidates[0];
        const expanded = expandedPluginId === pluginId;
        const updateRelease = matchingEntry ? getUpdateRelease(matchingEntry) : undefined;
        const hasPendingRestart = plugins.some(
          installedPlugin => installedPlugin.RestartPending || !installedPlugin.IsInstalled,
        );

        return (
          <div
            key={pluginId}
            className="overflow-hidden rounded-xl border border-panel-border bg-panel-input"
          >
            <div className="flex flex-col p-4 lg:flex-row lg:items-start lg:gap-3">
              <div
                role="button"
                tabIndex={0}
                aria-controls={`plugin-details-${pluginId}`}
                aria-expanded={expanded}
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-4 text-left lg:flex-row"
                onClick={() => setExpandedPluginId(currentId => (currentId === pluginId ? undefined : pluginId))}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;

                  event.preventDefault();
                  setExpandedPluginId(currentId => (currentId === pluginId ? undefined : pluginId));
                }}
              >
                <div className="w-full shrink-0 lg:w-44 lg:flex-none">
                  {thumbnailUrl
                    ? (
                      <img
                        src={thumbnailUrl}
                        alt={plugin.Name}
                        className="block w-full rounded-lg border border-panel-border"
                        onError={() => setFailedThumbnailUrls(prev => ({ ...prev, [thumbnailUrl]: true }))}
                      />
                    )
                    : (
                      <div className="aspect-video w-full rounded-lg border border-panel-border bg-panel-background-alt">
                        <div className="size-full" />
                      </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">{plugin.Name}</div>
                      <span className="rounded-lg bg-panel-background-alt px-2 py-1 text-xs font-medium">
                        {plugins[0]?.Version}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-3 text-sm/6 opacity-80">{plugin.Description}</div>
                    <div className="mt-2 flex flex-wrap gap-x-1 text-sm opacity-65">
                      <span>{plugins.length}</span>
                      <span>installed version(s)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {updateRelease && (
                      <Badge className="border border-green-500/30 bg-green-500/20 text-green-100">
                        Update available
                      </Badge>
                    )}
                    {hasPendingRestart && (
                      <Badge className="border border-orange-500/30 bg-orange-500/15 text-orange-100">
                        Restart required
                      </Badge>
                    )}
                    {!plugin.CanLoad && (
                      <Badge className="border border-red-500/50 bg-red-500/25 text-red-100">
                        Incompatible
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {matchingEntry && updateRelease && (
                <div className="flex shrink-0 flex-wrap justify-end gap-3 pt-3 lg:pt-1">
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    onClick={() =>
                      setSelectedUpgrade({
                        currentVersion: plugins[0]?.Version ?? plugin.Version,
                        packageId: matchingEntry.PackageID,
                        release: updateRelease,
                      })}
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>

            {expanded && (
              <div id={`plugin-details-${pluginId}`} className="bg-panel-background-alt/30 px-4 pb-4">
                <InstalledPluginVersions packageEntry={matchingEntry} plugins={plugins} />
              </div>
            )}
          </div>
        );
      })}

      <InstallPluginDialog
        currentVersion={selectedUpgrade?.currentVersion}
        entry={selectedEntry}
        initialRelease={selectedUpgrade?.release}
        show={!!selectedEntry}
        onClose={() => setSelectedUpgrade(undefined)}
      />
    </div>
  );
};

export default InstalledPluginsPanel;
