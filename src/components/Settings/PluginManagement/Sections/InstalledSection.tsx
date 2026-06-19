import React, { useState } from 'react';
import { mdiLoading, mdiPower, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';

import { Badge } from '@/components/Badge';
import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import { useDeleteAllPluginVersionsMutation, useUpdatePluginMutation } from '@/core/react-query/plugin/mutations';
import { usePluginsQuery } from '@/core/react-query/plugin/queries';
import toast from '@/core/toast';

import type { PluginInfoType } from '@/core/types/api/plugin';

type Props = {
  query: string;
};

const Plugin = ({ plugin }: { plugin: PluginInfoType }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [purgeConfiguration, setPurgeConfiguration] = useState(false);

  const { isPending: isUninstallPending, mutateAsync: uninstallPlugin } = useDeleteAllPluginVersionsMutation();
  const { isPending: isUpdatePending, mutate: updatePlugin } = useUpdatePluginMutation();

  const handleUninstall = async () => {
    await uninstallPlugin({ pluginId: plugin.ID, purgeConfiguration })
      .then(() => toast.success('Plugin uninstalled!', plugin.Name))
      .catch(() => toast.error('Failed to uninstall plugin', plugin.Name));
  };

  const thumbnailUrl = plugin.Thumbnail ? `/api/v3/Plugin/${plugin.ID}/Thumbnail` : null;
  return (
    <div className="flex gap-x-4 rounded-lg border border-panel-border bg-panel-input p-4">
      <div className="h-24 w-44 shrink-0 rounded-lg">
        {thumbnailUrl
          ? <img src={thumbnailUrl} alt={plugin.Name} className="max-h-24 w-44 rounded-lg object-contain" />
          : <div className="size-full rounded-lg bg-panel-background-alt" />}
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2 text-lg font-semibold">
            {plugin.Name}
            <Badge className="bg-panel-background-alt">
              {plugin.Version}
            </Badge>
          </div>
          <div className="flex gap-x-2">
            <Button
              onClick={() => updatePlugin({ pluginId: plugin.ID, isEnabled: !plugin.IsEnabled })}
              loading={isUpdatePending}
              disabled={!plugin.CanEnableOrDisable}
              tooltip={
                /* oxlint-disable-next-line no-nested-ternary */
                plugin.CanEnableOrDisable
                  ? (plugin.IsEnabled ? 'Disable' : 'Enable')
                  : 'Cannot be enabled/disabled'
              }
            >
              <Icon
                path={mdiPower}
                size={0.9}
                className={cx('text-panel-text-primary', !plugin.IsEnabled && 'opacity-65')}
              />
            </Button>
            <Button
              onClick={() => setConfirmDelete(true)}
              loading={isUninstallPending}
              disabled={!plugin.CanUninstall || !plugin.IsInstalled}
              tooltip={
                /* oxlint-disable-next-line no-nested-ternary */
                plugin.IsInstalled
                  ? (plugin.CanUninstall ? 'Uninstall' : 'Cannot be uninstalled')
                  : 'Already uninstalled'
              }
            >
              <Icon path={mdiTrashCanOutline} size={0.9} className="text-panel-text-danger" />
            </Button>
          </div>
        </div>

        <div className="text-sm opacity-65">
          {plugin.Description}
        </div>

        <div className="flex gap-x-2">
          {plugin.RestartPending && (
            <Badge className="bg-panel-text-warning text-button-primary-text">
              Restart required
            </Badge>
          )}

          {!plugin.CanLoad && (
            <Badge className="bg-panel-text-danger text-button-primary-text">
              Incompatible
            </Badge>
          )}
        </div>
      </div>

      <ConfirmationPromptModal
        onConfirm={handleUninstall}
        onClose={() => setConfirmDelete(false)}
        show={confirmDelete}
        confirmButtonType="danger"
        confirmText="Uninstall"
        title={`Uninstall ${plugin.Name}`}
      >
        <div className="flex flex-wrap">
          Do you want to uninstall the plugin&nbsp;
          <span className="font-semibold text-panel-text-important">{plugin.Name}</span>
          ?
        </div>

        <div className="rounded-lg border border-panel-border bg-panel-input px-4 py-3">
          <Checkbox
            id="plugin-uninstall-purge-configuration"
            isChecked={purgeConfiguration}
            label="Remove plugin configuration"
            labelRight
            onChange={event => setPurgeConfiguration(event.target.checked)}
          />
          <div className="mt-2 text-sm opacity-65">
            Leave unchecked to keep configuration if the plugin is reinstalled later.
          </div>
        </div>
      </ConfirmationPromptModal>
    </div>
  );
};

const InstalledSection = ({ query }: Props) => {
  const pluginsQuery = usePluginsQuery({ query });

  if (pluginsQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  if (pluginsQuery.isError) {
    return (
      <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Installed plugins unavailable</div>
        <div className="opacity-65">
          Installed plugin data could not be loaded.
        </div>
      </div>
    );
  }

  if (pluginsQuery.data?.length === 0) {
    return <div className="rounded-lg border border-panel-border bg-panel-input p-6">No installed plugins found.</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {map(pluginsQuery.data, plugin => <Plugin key={plugin.ID} plugin={plugin} />)}
    </div>
  );
};

export default InstalledSection;
