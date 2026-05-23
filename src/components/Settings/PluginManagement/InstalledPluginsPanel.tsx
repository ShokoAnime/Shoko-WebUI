import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import InstalledPluginVersions from '@/components/Settings/PluginManagement/InstalledPluginVersions';
import { getPluginThumbnailUrl } from '@/core/utilities/pluginManagement';

import type { PluginGroupsType } from '@/core/react-query/plugin/types';
import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';

type Props = {
  groupedPackages: PluginPackageCatalogEntryType[];
  groupedPlugins: PluginGroupsType;
};

const InstalledPluginsPanel = ({ groupedPackages, groupedPlugins }: Props) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<string>();
  const pluginGroups = Object.entries(groupedPlugins);
  const selectedEntry = groupedPackages.find(entry => entry.PackageID === selectedPackageId);

  if (pluginGroups.length === 0) {
    return <div className="rounded-lg border border-panel-border bg-panel-input p-6">No installed plugins found.</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {pluginGroups.map(([pluginId, plugins]) => {
        const plugin = plugins[0];
        const expanded = !!expandedIds[pluginId];
        const updateEntry = groupedPackages.find(entry => entry.Plugin?.ID === pluginId && entry.HasUpdateAvailable);
        const hasReadOnlyVersions = plugins.every(
          installedPlugin => installedPlugin.RestartPending || !installedPlugin.CanUninstall,
        );

        return (
          <div key={pluginId} className="rounded-lg border border-panel-border bg-panel-background-alt p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <button
                type="button"
                className="flex w-full items-start gap-4 text-left"
                onClick={() => setExpandedIds(state => ({ ...state, [pluginId]: !expanded }))}
              >
                <div className="shrink-0">
                  {plugin.Thumbnail
                    ? (
                      <img
                        src={getPluginThumbnailUrl(plugin.ID)}
                        alt={plugin.Name}
                        className="size-18 rounded-lg border border-panel-border object-cover"
                      />
                    )
                    : <div className="size-18 rounded-lg border border-panel-border bg-panel-input" />}
                </div>
                <div className="flex grow flex-col gap-y-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
                    <div>
                      <div className="text-lg font-semibold">{plugin.Name}</div>
                      <div className="text-sm opacity-80">{plugin.Description}</div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {updateEntry && (
                        <span className="rounded-lg bg-button-primary px-2 py-1 text-xs text-button-primary-text">
                          Update available
                        </span>
                      )}
                      {plugin.IsActive && (
                        <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Active</span>
                      )}
                      {hasReadOnlyVersions && (
                        <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Built-in</span>
                      )}
                      {!plugin.CanLoad && (
                        <span className="rounded-lg border border-button-danger-border px-2 py-1 text-xs text-button-danger-text">
                          Incompatible
                        </span>
                      )}
                      {plugin.RestartPending && (
                        <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Needs restart</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-1 text-sm opacity-65">
                    <span>{plugins.length}</span>
                    <span>installed version(s)</span>
                  </div>
                </div>
              </button>
              {updateEntry && (
                <div className="shrink-0 self-start lg:self-auto">
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    onClick={() => setSelectedPackageId(updateEntry.PackageID)}
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>

            {expanded && (
              <div className="mt-4">
                <InstalledPluginVersions plugins={plugins} />
              </div>
            )}
          </div>
        );
      })}

      <InstallPluginDialog
        entry={selectedEntry}
        show={!!selectedEntry}
        onClose={() => setSelectedPackageId(undefined)}
      />
    </div>
  );
};

export default InstalledPluginsPanel;
