import React from 'react';

import Button from '@/components/Input/Button';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import toast from '@/components/Toast';
import { useCheckPluginPackageUpdatesMutation } from '@/core/react-query/plugin-package/mutations';

import type { PluginPackageCatalogEntryType, PluginUpdateSummaryType } from '@/core/react-query/plugin-package/types';

type Props = {
  entries: PluginPackageCatalogEntryType[];
  isLoading: boolean;
  updates: PluginUpdateSummaryType[];
};

const PluginUpdatesPanel = ({ entries, isLoading, updates }: Props) => {
  const { mutate: checkUpdates, status } = useCheckPluginPackageUpdatesMutation();
  const [selectedPackageId, setSelectedPackageId] = React.useState<string>();
  const selectedEntry = entries.find(entry => entry.PackageID === selectedPackageId);
  const updatesContent = (() => {
    if (isLoading) return <div>Loading available updates...</div>;
    if (updates.length === 0) return <div>No plugin updates are currently available.</div>;

    return (
      <div className="flex flex-col gap-y-3">
        {updates.map(update => (
          <div
            key={`${update.ID}-${update.LatestVersion}`}
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
                onClick={() => setSelectedPackageId(update.PackageID)}
              >
                Upgrade
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-start sm:justify-end">
        <Button
          buttonType="primary"
          buttonSize="normal"
          onClick={() =>
            checkUpdates({ forceSync: true, performUpgrade: false }, {
              onSuccess: () => toast.success('Update check complete'),
            })}
          loading={status === 'pending'}
        >
          Check For Updates
        </Button>
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="mb-4 text-lg font-semibold">Available Updates</div>
        {updatesContent}
      </div>

      <InstallPluginDialog
        entry={selectedEntry}
        show={!!selectedEntry}
        onClose={() => setSelectedPackageId(undefined)}
      />
    </div>
  );
};

export default PluginUpdatesPanel;
