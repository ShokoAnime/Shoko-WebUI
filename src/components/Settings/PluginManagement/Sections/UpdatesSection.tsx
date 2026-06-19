import React, { useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { filter } from 'lodash';
import { useToggle } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import PluginInstallModal from '@/components/Settings/PluginManagement/Dialogs/PluginInstallModal';
import { useCheckPluginPackageUpdatesMutation } from '@/core/react-query/plugin-package/mutations';
import { usePluginPackageUpdatesQuery } from '@/core/react-query/plugin-package/queries';
import toast from '@/core/toast';

import type { PluginPackageUpdateInfoType } from '@/core/types/api/plugin-package';

type Props = {
  query: string;
};

const UpdatesSection = ({ query }: Props) => {
  const { isPending, mutate: checkUpdates } = useCheckPluginPackageUpdatesMutation();

  const [showUpdateModal, toggleUpdateModal] = useToggle(false);
  const [selectedPackage, setSelectedPackage] = useState<PluginPackageUpdateInfoType>();

  const pluginUpdatesQuery = usePluginPackageUpdatesQuery();
  const pluginUpdates = filter(
    pluginUpdatesQuery.data?.List,
    update => update.Name.toLowerCase().includes(query ?? ''),
  );

  if (pluginUpdatesQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  if (pluginUpdatesQuery.isError) {
    return (
      <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Updates unavailable</div>
        <div className="opacity-65">
          Plugin update data could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-end">
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

      {pluginUpdates.length === 0
        ? (
          <div className="rounded-lg border border-panel-border bg-panel-input p-6">
            No plugin updates are currently available.
          </div>
        )
        : (
          <div className="flex flex-col gap-y-3">
            {pluginUpdates.map(update => (
              <div
                key={update.PackageID}
                className="rounded-lg border border-panel-border bg-panel-input p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="flex gap-x-2 font-semibold">
                      {update.Name}
                      {update.Latest.Release.IsInstalled && (
                        <Badge className="bg-panel-text-warning text-button-primary-text">
                          Restart required
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm opacity-65">
                      {update.Current.Release.Version}
                      &nbsp;→&nbsp;
                      {update.Latest.Release.Version}
                    </div>
                  </div>
                  <Button
                    buttonType={update.Latest.Release.IsInstalled ? 'secondary' : 'primary'}
                    buttonSize="small"
                    onClick={() => {
                      setSelectedPackage(update);
                      toggleUpdateModal();
                    }}
                    disabled={update.Latest.Release.IsInstalled}
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      {selectedPackage && (
        <PluginInstallModal
          show={showUpdateModal}
          onClose={toggleUpdateModal}
          oldPackage={selectedPackage.Current}
          newPackage={selectedPackage.Latest}
          packageId={selectedPackage.PackageID}
        />
      )}
    </div>
  );
};

export default UpdatesSection;
