import React, { useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import CatalogItem from '@/components/Settings/PluginManagement/CatalogItem';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';
import { selectGroupedPluginPackages, usePluginPackagesQuery } from '@/core/react-query/plugin-package/queries';

import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';

type SelectedInstallType = {
  entry: PluginPackageCatalogEntryType;
  release?: PluginPackageCatalogEntryType['Releases'][number];
};

type Props = {
  query: string;
};

const emptyEntries: PluginPackageCatalogEntryType[] = [];

const CatalogPanel = ({ query }: Props) => {
  const [selectedInstall, setSelectedInstall] = useState<SelectedInstallType | undefined>();
  const packagesQuery = usePluginPackagesQuery(
    {
      allowSync: false,
      onlyCompatible: false,
      onlyLatest: false,
      pageSize: 0,
      query: query || undefined,
    },
    { select: selectGroupedPluginPackages },
  );
  const entries = packagesQuery.data ?? emptyEntries;
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
        <div className="text-lg font-semibold">Catalog unavailable</div>
        <div className="mt-2 opacity-80">
          The plugin catalog could not be loaded. Retry the request to browse available packages.
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
      {entries.length === 0
        ? <div className="rounded-lg border border-panel-border bg-panel-input p-6">No plugins found.</div>
        : (
          <div className="flex flex-col gap-y-4">
            {entries.map(entry => (
              <CatalogItem
                key={entry.PackageID}
                entry={entry}
                onInstall={(installEntry, release) => setSelectedInstall({ entry: installEntry, release })}
              />
            ))}
          </div>
        )}

      <InstallPluginDialog
        entry={selectedInstall?.entry}
        initialRelease={selectedInstall?.release}
        show={!!selectedInstall}
        onClose={() => setSelectedInstall(undefined)}
      />
    </div>
  );
};

export default CatalogPanel;
