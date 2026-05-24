import React, { useEffect, useRef, useState } from 'react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import InstalledPluginVersions from '@/components/Settings/PluginManagement/InstalledPluginVersions';
import { axios } from '@/core/axios';
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
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  const thumbnailUrlRefs = useRef<Record<string, string>>({});
  const loadedThumbnailRefs = useRef<Record<string, boolean>>({});

  const pluginGroups = Object.entries(groupedPlugins);
  const selectedEntry = groupedPackages.find(entry => entry.PackageID === selectedPackageId);

  useEffect(() => {
    const fetchThumbnail = async (pluginId: string, contentType?: string) => {
      if (loadedThumbnailRefs.current[pluginId]) return;

      try {
        const response = await axios.get<Blob>(getPluginThumbnailUrl(pluginId), {
          responseType: 'blob',
        });

        const responseBlob = response as unknown as Blob;

        const blob = contentType && responseBlob.type !== contentType
          ? responseBlob.slice(0, responseBlob.size, contentType)
          : responseBlob;

        const url = URL.createObjectURL(blob);

        thumbnailUrlRefs.current[pluginId] = url;
        loadedThumbnailRefs.current[pluginId] = true;

        setThumbnailUrls(prev => ({
          ...prev,
          [pluginId]: url,
        }));
      } catch {
        // Missing thumbnails are expected for some plugins.
        loadedThumbnailRefs.current[pluginId] = true;
      }
    };

    Object.entries(groupedPlugins).forEach(([, plugins]) => {
      const plugin = plugins[0];

      if (!plugin?.Thumbnail) return;

      fetchThumbnail(plugin.ID, plugin.Thumbnail?.MimeType).catch(() => {
        // handled in fetchThumbnail
      });
    });
  }, [groupedPlugins]);

  if (pluginGroups.length === 0) {
    return <div className="rounded-lg border border-panel-border bg-panel-input p-6">No installed plugins found.</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {pluginGroups.map(([pluginId, plugins]) => {
        const plugin = plugins[0];
        const thumbnailUrl = thumbnailUrls[plugin.ID];
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
                  {thumbnailUrl
                    ? (
                      <img
                        src={thumbnailUrl}
                        alt={plugin.Name}
                        className="block size-18 rounded-lg border border-panel-border object-contain"
                        onError={() =>
                          setThumbnailUrls((prev) => {
                            const next = { ...prev };
                            delete next[plugin.ID];
                            return next;
                          })}
                      />
                    )
                    : <div className="size-18 rounded-lg border border-panel-border bg-panel-input" />}
                </div>

                <div className="flex grow flex-col gap-y-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-semibold">{plugin.Name}</div>
                      <div className="text-sm opacity-80">{plugin.Description}</div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      {updateEntry && (
                        <span className="rounded-lg border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs whitespace-nowrap text-green-100">
                          Update available
                        </span>
                      )}
                      {plugin.RestartPending && (
                        <span className="rounded-lg bg-orange-500/15 px-2 py-1 text-xs whitespace-nowrap text-orange-100">
                          Restart required
                        </span>
                      )}
                      {!plugin.CanLoad && (
                        <span className="rounded-lg border border-red-500/50 bg-red-500/25 px-2 py-1 text-xs whitespace-nowrap text-red-100">
                          Incompatible
                        </span>
                      )}
                      {plugin.IsActive && (
                        <span className="rounded-lg border border-panel-border px-2 py-1 text-xs whitespace-nowrap">
                          Active
                        </span>
                      )}
                      {hasReadOnlyVersions && (
                        <span className="rounded-lg border border-panel-border px-2 py-1 text-xs whitespace-nowrap">
                          Built-in
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-1 text-sm opacity-65">
                    <span>{plugins.length}</span>
                    <span>installed version(s)</span>
                  </div>
                </div>
              </button>

              <div className="flex shrink-0 flex-wrap justify-end gap-3 self-start lg:self-auto">
                {updateEntry && (
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    onClick={() => setSelectedPackageId(updateEntry.PackageID)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
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
