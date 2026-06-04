import React, { useMemo, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import toast from '@/components/Toast';
import { getPluginUpdates, getReleaseKey, groupPluginPackages } from '@/core/react-query/plugin-package/helpers';
import { useCheckPluginPackageUpdatesMutation } from '@/core/react-query/plugin-package/mutations';
import { usePluginPackagesQuery } from '@/core/react-query/plugin-package/queries';

import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';

type Props = {
  query: string;
};

type SelectedUpdateType = {
  currentVersion: string;
  packageId: string;
  release: PluginPackageCatalogEntryType['Releases'][number];
};

const PluginUpdatesPanel = ({ query }: Props) => {
  const { isPending, mutate: checkUpdates } = useCheckPluginPackageUpdatesMutation();
  const [selectedUpdate, setSelectedUpdate] = useState<SelectedUpdateType>();
  // No query param is passed to the API here. The Updates tab must always see the full
  // package set so it can detect every installed package that has an update available.
  // Passing query would exclude non-matching packages and hide their updates from view.
  // The search string is applied client-side to the already-computed update list instead.
  const packagesQuery = usePluginPackagesQuery({
    allowSync: false,
    onlyCompatible: false,
    onlyLatest: false,
    pageSize: 0,
  });
  const entries = useMemo(
    () => groupPluginPackages(packagesQuery.data?.List ?? []),
    [packagesQuery.data?.List],
  );
  const updates = useMemo(() => {
    const pluginUpdates = getPluginUpdates(entries);

    if (!query) return pluginUpdates;

    const lowerQuery = query.toLowerCase();

    return pluginUpdates.filter(
      update =>
        update.Name.toLowerCase().includes(lowerQuery)
        || update.CurrentVersion.toLowerCase().includes(lowerQuery)
        || update.LatestVersion.toLowerCase().includes(lowerQuery),
    );
  }, [entries, query]);
  const selectedEntry = entries.find(entry => entry.PackageID === selectedUpdate?.packageId);
  const retryPackages = () => {
    packagesQuery.refetch().catch(console.error);
  };

  if (packagesQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  if (packagesQuery.isError) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Updates unavailable</div>
        <div className="mt-2 opacity-80">
          Plugin update data could not be loaded. Retry to refresh the available updates list.
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={retryPackages}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-start sm:justify-end">
        <Button
          buttonType="primary"
          buttonSize="normal"
          onClick={() =>
            checkUpdates({ forceSync: true, performUpgrade: false }, {
              onSuccess: () => toast.success('Update check complete'),
              onError: () => toast.error('Failed to check for updates'),
            })}
          loading={isPending}
        >
          Check For Updates
        </Button>
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="mb-4 text-lg font-semibold">Available Updates</div>
        {updates.length === 0 && <div>No plugin updates are currently available.</div>}
        {updates.length > 0 && (
          <div className="flex flex-col gap-y-3">
            {updates.map(update => (
              <div
                key={`${update.PackageID}-${getReleaseKey(update.Release)}`}
                className="rounded-lg border border-panel-border bg-panel-background-alt p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-4">
                  <div>
                    <div className="font-semibold">{update.Name}</div>
                    <div className="text-sm opacity-80">
                      {update.CurrentVersion}
                      {' → '}
                      {update.LatestVersion}
                    </div>
                  </div>
                  <Button
                    buttonType="primary"
                    buttonSize="small"
                    onClick={() =>
                      setSelectedUpdate({
                        currentVersion: update.CurrentVersion,
                        packageId: update.PackageID,
                        release: update.Release,
                      })}
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InstallPluginDialog
        currentVersion={selectedUpdate?.currentVersion}
        entry={selectedEntry}
        initialRelease={selectedUpdate?.release}
        show={!!selectedEntry}
        onClose={() => setSelectedUpdate(undefined)}
      />
    </div>
  );
};

export default PluginUpdatesPanel;
