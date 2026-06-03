import React from 'react';
import dayjs from 'dayjs';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import toast from '@/components/Toast';
import {
  useDeleteAllPluginVersionsMutation,
  useDeletePluginMutation,
  useUpdatePluginMutation,
} from '@/core/react-query/plugin/mutations';
import { getPackageInstallArgs } from '@/core/react-query/plugin-package/helpers';
import { useInstallPluginPackageMutation } from '@/core/react-query/plugin-package/mutations';

import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
} from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';

type Props = {
  packageEntry?: PluginPackageCatalogEntryType;
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

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => (
  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${className ?? ''}`.trim()}>
    {children}
  </span>
);

const formatPluginDate = (date: string) => dayjs(date).format('D MMMM YYYY');

const getPreferredArchive = (
  plugin: PluginInfoType,
  release?: PluginPackageCatalogReleaseType,
): PluginPackageCatalogArchiveType | undefined =>
  release?.Archives.find(
    archive =>
      archive.IsCompatible
      && archive.RuntimeIdentifier === plugin.RuntimeIdentifier
      && archive.AbstractionVersion === plugin.AbstractionVersion,
  )
    ?? release?.Archives.find(archive => archive.IsCompatible)
    ?? release?.Archives[0];

const InstalledPluginVersions = ({ packageEntry, plugins }: Props) => {
  const { mutate: updatePlugin, status: updateStatus, variables: updateArgs } = useUpdatePluginMutation();
  const { mutate: deletePlugin, status: deleteStatus, variables: deleteArgs } = useDeletePluginMutation();
  const { mutate: deleteAllPluginVersions, status: deleteAllStatus, variables: deleteAllArgs } =
    useDeleteAllPluginVersionsMutation();
  const { mutate: installPlugin, status: installStatus, variables: installArgs } = useInstallPluginPackageMutation();
  const [pendingDelete, setPendingDelete] = React.useState<PendingDeleteType | null>(null);
  const [purgeConfiguration, setPurgeConfiguration] = React.useState(false);
  const isUndoInstall = pendingDelete?.kind === 'version'
    && pendingDelete.plugin.IsInstalled
    && !pendingDelete.plugin.IsActive
    && pendingDelete.plugin.RestartPending;
  const showPurgeConfigurationOption = !!pendingDelete && !isUndoInstall;
  const deleteModalTitle = pendingDelete?.kind === 'all'
    ? 'Uninstall All Plugin Versions'
    : 'Uninstall Plugin Version';
  const closeDeletePrompt = () => {
    setPendingDelete(null);
    setPurgeConfiguration(false);
  };

  // Get the first plugin in the list as a representative for the group
  const representativePlugin = plugins[0];
  const groupCanUninstall = plugins.some(plugin => plugin.CanUninstall);

  return (
    <div className="flex flex-col gap-y-3">
      {/* Uninstall All button at the top of the plugin group */}
      <div className="flex justify-end pt-4">
        {plugins.length > 1 && (
          <Button
            buttonType="danger"
            buttonSize="small"
            disabled={!groupCanUninstall || !plugins.some(plugin => plugin.IsInstalled)}
            onClick={() => {
              setPurgeConfiguration(false);
              setPendingDelete({ kind: 'all', plugin: representativePlugin });
            }}
            loading={deleteAllStatus === 'pending' && deleteAllArgs?.pluginId === representativePlugin.ID}
          >
            Uninstall All Versions
          </Button>
        )}
      </div>

      {plugins.map((plugin) => {
        // The server uses UninstalledAt to derive IsInstalled, so any installed-then-uninstalled
        // plugin in the current session reports IsInstalled=false until restart. RestartPending
        // is derived from IsEnabled !== IsActive on the server, which misses uninstalled inactive
        // versions, so we use IsInstalled as the primary pending-uninstall signal.
        const isPendingUninstall = !plugin.IsInstalled;
        const isPendingInstall = plugin.IsInstalled && plugin.RestartPending && !plugin.IsActive;
        const restartRequired = plugin.RestartPending || isPendingUninstall;
        const packageRelease = packageEntry?.Releases.find(release => release.Version === plugin.Version);
        const packageArchive = getPreferredArchive(plugin, packageRelease);
        const packageInstallArgs = packageEntry && packageRelease && packageArchive
          ? getPackageInstallArgs(packageEntry.PackageID, packageRelease, packageArchive)
          : undefined;
        const isBuiltIn = !plugin.CanUninstall;
        const canUninstall = plugin.CanUninstall && !isPendingUninstall;
        const canUndoUninstall = isPendingUninstall && !!packageInstallArgs && !!packageArchive?.IsCompatible;

        return (
          <div
            key={`${plugin.ID}-${plugin.Version}`}
            className="rounded-xl border border-panel-border bg-panel-background-alt p-4"
          >
            <div className="flex flex-col gap-y-3">
              <div className="font-semibold">{`Version ${plugin.Version}`}</div>

              <div className="flex flex-wrap gap-2">
                {restartRequired && (
                  <Badge className="border border-orange-500/30 bg-orange-500/15 text-orange-100">
                    Restart required
                  </Badge>
                )}
                {isPendingUninstall && (
                  <Badge className="border border-red-500/50 bg-red-500/25 text-red-100">
                    Pending uninstall
                  </Badge>
                )}
                {isPendingInstall && (
                  <Badge className="border border-green-500/30 bg-green-500/20 text-green-100">
                    Pending install
                  </Badge>
                )}
                {!plugin.CanLoad && (
                  <Badge className="border border-red-500/50 bg-red-500/25 text-red-100">
                    Incompatible
                  </Badge>
                )}
                {plugin.IsActive && (
                  <Badge className="border border-panel-border bg-panel-input text-inherit">
                    Active
                  </Badge>
                )}
                {isBuiltIn && !restartRequired && (
                  <Badge className="border border-panel-border bg-panel-input text-inherit">
                    Built-in
                  </Badge>
                )}
                {plugin.IsPinned && (
                  <Badge className="border border-panel-border bg-panel-input text-inherit">
                    Pinned (read-only)
                  </Badge>
                )}
                {plugin.CanLoad && (
                  <Badge className="border border-panel-border bg-panel-input text-inherit">
                    Compatible
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span>Installed:</span>
                <span>{formatPluginDate(plugin.InstalledAt)}</span>
                <span>•</span>
                <span>Abstraction:</span>
                <span>{plugin.AbstractionVersion}</span>
                <span>•</span>
                <span>Runtime:</span>
                <span>{plugin.RuntimeIdentifier}</span>
              </div>
            </div>

            {restartRequired && (
              <div className="mt-4 rounded-lg border border-panel-border bg-panel-input px-4 py-3 text-sm">
                {isPendingUninstall && 'Restart the server to finish uninstalling this plugin.'}
                {isPendingInstall && 'Restart the server to finish installing this plugin.'}
                {!isPendingUninstall && !isPendingInstall
                  && 'Restart the server to apply the pending plugin state changes.'}
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Button
                buttonType="secondary"
                buttonSize="small"
                onClick={() =>
                  updatePlugin(
                    { pluginId: plugin.ID, pluginVersion: plugin.Version, IsEnabled: !plugin.IsEnabled },
                    {
                      onSuccess: () =>
                        toast.success(
                          'Plugin updated',
                          `${plugin.Name} ${plugin.IsEnabled ? 'disabled' : 'enabled'}.`,
                        ),
                      onError: () => toast.error('Failed to update plugin', `Could not update ${plugin.Name}`),
                    },
                  )}
                disabled={isPendingUninstall || !plugin.CanEnableOrDisable}
                loading={updateStatus === 'pending' && updateArgs?.pluginId === plugin.ID
                  && updateArgs?.pluginVersion === plugin.Version}
              >
                {plugin.IsEnabled ? 'Disable' : 'Enable'}
              </Button>
              {isPendingUninstall
                ? (
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    disabled={!canUndoUninstall}
                    onClick={() => {
                      if (!packageInstallArgs) return;

                      installPlugin(packageInstallArgs, {
                        onSuccess: () => toast.success('Pending uninstall undone', `${plugin.Name} ${plugin.Version}`),
                        onError: () =>
                          toast.error('Failed to undo pending uninstall', `${plugin.Name} ${plugin.Version}`),
                      });
                    }}
                    loading={installStatus === 'pending' && installArgs?.packageId === packageEntry?.PackageID
                      && installArgs?.releaseVersion === plugin.Version}
                  >
                    Undo Uninstall
                  </Button>
                )
                : (
                  <Button
                    buttonType="danger"
                    buttonSize="small"
                    disabled={!canUninstall}
                    onClick={() => {
                      setPurgeConfiguration(false);
                      setPendingDelete({ kind: 'version', plugin });
                    }}
                    loading={deleteStatus === 'pending' && deleteArgs?.pluginId === plugin.ID
                      && deleteArgs?.pluginVersion === plugin.Version}
                  >
                    {isPendingInstall ? 'Undo Install' : 'Uninstall Version'}
                  </Button>
                )}
            </div>
          </div>
        );
      })}

      <ConfirmationPromptModal
        show={!!pendingDelete}
        title={isUndoInstall ? 'Undo Pending Plugin Install' : deleteModalTitle}
        confirmButtonType="danger"
        confirmText={isUndoInstall ? 'Undo Install' : 'Uninstall'}
        onClose={closeDeletePrompt}
        onConfirm={() => {
          if (!pendingDelete) return;

          if (pendingDelete.kind === 'all') {
            deleteAllPluginVersions({ pluginId: pendingDelete.plugin.ID, purgeConfiguration }, {
              onSuccess: () => toast.success('All plugin versions uninstalled', pendingDelete.plugin.Name),
              onError: () => toast.error('Failed to uninstall all plugin versions', pendingDelete.plugin.Name),
            });
            return;
          }

          deletePlugin({
            pluginId: pendingDelete.plugin.ID,
            pluginVersion: pendingDelete.plugin.Version,
            purgeConfiguration: isUndoInstall ? false : purgeConfiguration,
          }, {
            onSuccess: () =>
              toast.success(
                isUndoInstall ? 'Pending install undone' : 'Plugin uninstalled',
                `${pendingDelete.plugin.Name} ${pendingDelete.plugin.Version}`,
              ),
            onError: () =>
              toast.error(
                isUndoInstall ? 'Failed to undo pending install' : 'Failed to uninstall plugin',
                `${pendingDelete.plugin.Name} ${pendingDelete.plugin.Version}`,
              ),
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
              <span>{isUndoInstall ? 'Undo the pending install for' : 'Uninstall'}</span>
              <span className="font-semibold">{pendingDelete?.plugin.Name}</span>
              <span className="font-semibold">{pendingDelete?.plugin.Version}</span>
              <span>?</span>
            </div>
          )}
        {showPurgeConfigurationOption && (
          <div className="rounded-lg border border-panel-border bg-panel-input px-4 py-3">
            <Checkbox
              id="plugin-uninstall-purge-configuration"
              isChecked={purgeConfiguration}
              label="Also remove plugin configuration"
              labelRight
              onChange={event => setPurgeConfiguration(event.target.checked)}
            />
            <div className="mt-2 text-sm opacity-70">
              Leave unchecked to keep configuration if the plugin is reinstalled later.
            </div>
          </div>
        )}
      </ConfirmationPromptModal>
    </div>
  );
};

export default InstalledPluginVersions;
