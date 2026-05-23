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
  const { mutate: updatePlugin, variables: updateArgs } = useUpdatePluginMutation();
  const { mutate: deletePlugin, variables: deleteArgs } = useDeletePluginMutation();
  const { mutate: deleteAllPluginVersions, variables: deleteAllArgs } = useDeleteAllPluginVersionsMutation();
  const [pendingDelete, setPendingDelete] = React.useState<PendingDeleteType | null>(null);

  return (
    <div className="flex flex-col gap-y-3">
      {plugins.map((plugin) => {
        const isReadOnly = plugin.RestartPending || !plugin.CanUninstall;

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
                {isReadOnly && (
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

            <div className="mb-4 flex flex-wrap gap-x-1 text-sm opacity-65">
              <span>Installed:</span>
              <span>{new Date(plugin.InstalledAt).toLocaleString()}</span>
            </div>

            {plugin.RestartPending && (
              <div className="mb-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 text-sm">
                Restart the server to finish removing or unloading this plugin.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                buttonType="secondary"
                buttonSize="small"
                onClick={() =>
                  updatePlugin({ pluginId: plugin.ID, pluginVersion: plugin.Version, isEnabled: !plugin.IsEnabled }, {
                    onSuccess: () =>
                      toast.success('Plugin updated', `${plugin.Name} ${plugin.IsEnabled ? 'disabled' : 'enabled'}.`),
                  })}
                disabled={isReadOnly}
                loading={updateArgs?.pluginId === plugin.ID && updateArgs?.pluginVersion === plugin.Version}
              >
                {plugin.IsEnabled ? 'Disable' : 'Enable'}
              </Button>
              <Button
                buttonType="danger"
                buttonSize="small"
                disabled={isReadOnly}
                onClick={() => setPendingDelete({ kind: 'version', plugin })}
                loading={deleteArgs?.pluginId === plugin.ID && deleteArgs?.pluginVersion === plugin.Version}
              >
                Uninstall Version
              </Button>
              <Button
                buttonType="danger"
                buttonSize="small"
                disabled={isReadOnly}
                onClick={() => setPendingDelete({ kind: 'all', plugin })}
                loading={deleteAllArgs?.pluginId === plugin.ID}
              >
                Uninstall All
              </Button>
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
            });
            return;
          }

          deletePlugin({ pluginId: pendingDelete.plugin.ID, pluginVersion: pendingDelete.plugin.Version }, {
            onSuccess: () =>
              toast.success('Plugin uninstalled', `${pendingDelete.plugin.Name} ${pendingDelete.plugin.Version}`),
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
