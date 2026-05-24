import React from 'react';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import {
  useDeleteAllPluginVersionsMutation,
  useDeletePluginMutation,
  useUpdatePluginMutation,
} from '@/core/react-query/plugin/mutations';

import type { PluginInfoType } from '@/core/types/api/plugin';

type Props = {
  plugins: PluginInfoType[];
};

type PendingDeleteType =
  | {
    kind: 'version';
    plugin: PluginInfoType;
  }
  | {
    kind: 'all';
    plugin: PluginInfoType;
  };

const InstalledPluginVersions = ({ plugins }: Props) => {
  const { mutate: updatePlugin, status: updateStatus, variables: updateArgs } = useUpdatePluginMutation();
  const { mutate: deletePlugin, status: deleteStatus, variables: deleteArgs } = useDeletePluginMutation();
  const { mutate: deleteAllPluginVersions, status: deleteAllStatus, variables: deleteAllArgs } =
    useDeleteAllPluginVersionsMutation();
  const [pendingDelete, setPendingDelete] = React.useState<PendingDeleteType | null>(null);

  // Get the first plugin in the list as a representative for the group
  const representativePlugin = plugins[0];

  return (
    <div className="flex flex-col gap-y-3">
      {/* Uninstall All button at the top of the plugin group */}
      <div className="flex justify-end">
        {representativePlugin.LoadOrder !== 0 && (
          <Button
            buttonType="danger"
            buttonSize="small"
            disabled={!representativePlugin.IsInstalled || !representativePlugin.CanUninstall}
            onClick={() => setPendingDelete({ kind: 'all', plugin: representativePlugin })}
            loading={deleteAllStatus === 'pending' && deleteAllArgs?.pluginId === representativePlugin.ID}
          >
            Uninstall All Versions
          </Button>
        )}
      </div>

      {plugins.map((plugin) => {
        // Determine if plugin is readonly (restart pending)
        const isReadOnly = plugin.RestartPending;
        // Determine if plugin is server-bundled (not user-installed)
        // A plugin is server-bundled if it has no containing directory or is not user-installed
        const isServerBundled = !plugin.IsInstalled || plugin.ContainingDirectory === null
          || plugin.ContainingDirectory === undefined;
        // Determine if plugin can be uninstalled (user installed plugins that aren't restart pending)
        const canUninstall = plugin.IsInstalled && !plugin.RestartPending && plugin.CanUninstall;
        // Determine if plugin is core (should never be disabled)
        // Core plugins always have LoadOrder = 0
        const isCorePlugin = plugin.LoadOrder === 0;

        return (
          <div
            key={`${plugin.ID}-${plugin.Version}`}
            className="rounded-lg border border-panel-border bg-panel-input p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-x-3">
              <div className="font-semibold">{plugin.Version}</div>
              <div className="flex flex-wrap justify-end gap-2">
                {plugin.IsActive && (
                  <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Active</span>
                )}
                {isServerBundled && !plugin.RestartPending && (
                  <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Built-in</span>
                )}
                {plugin.IsPinned && (
                  <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Pinned</span>
                )}
                {!plugin.CanLoad && (
                  <span className="rounded-lg border border-button-danger-border px-2 py-1 text-xs text-button-danger-text">
                    Incompatible
                  </span>
                )}
                {plugin.CanLoad && (
                  <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Compatible</span>
                )}
                {plugin.RestartPending && (
                  <span className="rounded-lg border border-panel-border px-2 py-1 text-xs">Needs restart</span>
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span>Installed:</span>
              <span>{new Date(plugin.InstalledAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Abstraction:</span>
              <span>{plugin.AbstractionVersion}</span>
              <span>•</span>
              <span>Runtime:</span>
              <span>{plugin.RuntimeIdentifier}</span>
            </div>

            {plugin.RestartPending && (
              <div className="mb-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 text-sm">
                Restart the server to finish removing or unloading this plugin.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {isCorePlugin ? null : (
                <>
                  <Button
                    buttonType="secondary"
                    buttonSize="small"
                    onClick={() =>
                      updatePlugin(
                        { pluginId: plugin.ID, pluginVersion: plugin.Version, isEnabled: !plugin.IsEnabled },
                        {
                          onSuccess: () =>
                            toast.success(
                              'Plugin updated',
                              `${plugin.Name} ${plugin.IsEnabled ? 'disabled' : 'enabled'}.`,
                            ),
                          onError: () => toast.error('Failed to update plugin', `Could not update ${plugin.Name}`),
                        },
                      )}
                    disabled={isReadOnly || !plugin.CanEnableOrDisable}
                    loading={updateStatus === 'pending' && updateArgs?.pluginId === plugin.ID
                      && updateArgs?.pluginVersion === plugin.Version}
                  >
                    {plugin.IsEnabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    buttonType="danger"
                    buttonSize="small"
                    disabled={!canUninstall}
                    onClick={() => setPendingDelete({ kind: 'version', plugin })}
                    loading={deleteStatus === 'pending' && deleteArgs?.pluginId === plugin.ID
                      && deleteArgs?.pluginVersion === plugin.Version}
                  >
                    Uninstall Version
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmationPromptModal
        show={!!pendingDelete}
        title={pendingDelete?.kind === 'all' ? 'Uninstall All Plugin Versions' : 'Uninstall Plugin Version'}
        confirmButtonType="danger"
        confirmText="Uninstall"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;

          if (pendingDelete.kind === 'all') {
            deleteAllPluginVersions({ pluginId: pendingDelete.plugin.ID }, {
              onSuccess: () => toast.success('All plugin versions uninstalled', pendingDelete.plugin.Name),
              onError: () => toast.error('Failed to uninstall all plugin versions', pendingDelete.plugin.Name),
            });
            return;
          }

          deletePlugin({ pluginId: pendingDelete.plugin.ID, pluginVersion: pendingDelete.plugin.Version }, {
            onSuccess: () =>
              toast.success('Plugin uninstalled', `${pendingDelete.plugin.Name} ${pendingDelete.plugin.Version}`),
            onError: () =>
              toast.error('Failed to uninstall plugin', `${pendingDelete.plugin.Name} ${pendingDelete.plugin.Version}`),
          });
        }}
      >
        {pendingDelete?.kind === 'all'
          ? (
            <div className="flex flex-wrap gap-x-1">
              <span>Uninstall every installed version of</span>
              <span className="font-semibold">{pendingDelete.plugin.Name}</span>
              <span>?</span>
            </div>
          )
          : (
            <div className="flex flex-wrap gap-x-1">
              <span>Uninstall</span>
              <span className="font-semibold">{pendingDelete?.plugin.Name}</span>
              <span className="font-semibold">{pendingDelete?.plugin.Version}</span>
              <span>?</span>
            </div>
          )}
      </ConfirmationPromptModal>
    </div>
  );
};

export default InstalledPluginVersions;
