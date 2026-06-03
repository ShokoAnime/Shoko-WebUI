import React, { useEffect, useMemo, useState } from 'react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import InstalledPluginVersions from '@/components/Settings/PluginManagement/InstalledPluginVersions';
import { sortInstalledPluginGroups } from '@/core/react-query/plugin-package/helpers';

import type { PluginGroupsType } from '@/core/react-query/plugin/types';
import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';

type Props = {
  groupedPackages: PluginPackageCatalogEntryType[];
  groupedPlugins: PluginGroupsType;
};

type SelectedUpgradeType = {
  currentVersion: string;
  packageId: string;
  releaseVersion: string;
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
  const directMatch = entries.find(entry => entry.Plugin?.ID === pluginId || entry.PackageID === pluginId);
  if (directMatch) return directMatch;

  return entries.find((entry) => {
    const hasMatchingPlugin = plugins.some((plugin) => {
      if (entry.Plugin?.Name === plugin.Name) return true;
      if (entry.Name !== plugin.Name) return false;

      return entry.Releases.some(release => releaseMatchesPlugin(release, plugin));
    });

    return hasMatchingPlugin;
  });
};

const InstalledPluginsPanel = ({ groupedPackages, groupedPlugins }: Props) => {
  const [expandedPluginId, setExpandedPluginId] = useState<string>();
  const [failedThumbnailUrls, setFailedThumbnailUrls] = useState<Record<string, boolean>>({});
  const [selectedUpgrade, setSelectedUpgrade] = useState<SelectedUpgradeType>();

  const pluginGroups = useMemo(
    () => sortInstalledPluginGroups(groupedPlugins, groupedPackages),
    [groupedPackages, groupedPlugins],
  );
  const selectedEntry = groupedPackages.find(entry => entry.PackageID === selectedUpgrade?.packageId);

  useEffect(() => {
    setFailedThumbnailUrls({});
  }, [pluginGroups]);

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
          matchingEntry?.Plugin?.Thumbnail ? `/api/v3/Plugin/${matchingEntry.Plugin.ID}/Thumbnail` : undefined,
          thumbnailPlugin?.Thumbnail ? `/api/v3/Plugin/${thumbnailPlugin.ID}/Thumbnail` : undefined,
        ].filter(candidate => !!candidate && !failedThumbnailUrls[candidate]);
        const thumbnailUrl = thumbnailCandidates[0];
        const expanded = expandedPluginId === pluginId;
        const updateEntry = groupedPackages.find(entry => entry.Plugin?.ID === pluginId && entry.HasUpdateAvailable);
        const hasOnlyBuiltInVersions = plugins.every(installedPlugin => !installedPlugin.CanUninstall);

        return (
          <div
            key={pluginId}
            className="overflow-hidden rounded-xl border border-panel-border bg-panel-input"
          >
            <div className="flex flex-col p-4 lg:flex-row lg:items-start lg:gap-3">
              <div
                role="button"
                tabIndex={0}
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
                    {updateEntry && (
                      <Badge className="border border-green-500/30 bg-green-500/20 text-green-100">
                        Update available
                      </Badge>
                    )}
                    {plugin.RestartPending && (
                      <Badge className="border border-orange-500/30 bg-orange-500/15 text-orange-100">
                        Restart required
                      </Badge>
                    )}
                    {!plugin.CanLoad && (
                      <Badge className="border border-red-500/50 bg-red-500/25 text-red-100">
                        Incompatible
                      </Badge>
                    )}
                    {hasOnlyBuiltInVersions && (
                      <Badge className="border border-panel-border bg-panel-background-alt text-inherit">
                        Built-in
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {updateEntry && (
                <div className="flex shrink-0 flex-wrap justify-end gap-3 pt-3 lg:pt-1">
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    onClick={() =>
                      setSelectedUpgrade({
                        currentVersion: updateEntry.Plugin?.Version ?? plugin.Version,
                        packageId: updateEntry.PackageID,
                        releaseVersion: updateEntry.Releases[0].Version,
                      })}
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>

            {expanded && (
              <div className="bg-panel-background-alt/30 px-4 pb-4">
                <InstalledPluginVersions packageEntry={matchingEntry} plugins={plugins} />
              </div>
            )}
          </div>
        );
      })}

      <InstallPluginDialog
        currentVersion={selectedUpgrade?.currentVersion}
        entry={selectedEntry}
        initialReleaseVersion={selectedUpgrade?.releaseVersion}
        show={!!selectedEntry}
        onClose={() => setSelectedUpgrade(undefined)}
      />
    </div>
  );
};

export default InstalledPluginsPanel;
