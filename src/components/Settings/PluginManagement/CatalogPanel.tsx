import React, { useState } from 'react';

import CatalogItem from '@/components/Settings/PluginManagement/CatalogItem';
import InstallPluginDialog from '@/components/Settings/PluginManagement/InstallPluginDialog';

import type { PluginPackageCatalogEntryType } from '@/core/react-query/plugin-package/types';

type SelectedInstallType = {
  entry: PluginPackageCatalogEntryType;
  releaseVersion?: string;
};

type Props = {
  entries: PluginPackageCatalogEntryType[];
};

const CatalogPanel = ({ entries }: Props) => {
  const [selectedInstall, setSelectedInstall] = useState<SelectedInstallType | undefined>();

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
                onInstall={(installEntry, releaseVersion) =>
                  setSelectedInstall({ entry: installEntry, releaseVersion })}
              />
            ))}
          </div>
        )}

      <InstallPluginDialog
        entry={selectedInstall?.entry}
        initialReleaseVersion={selectedInstall?.releaseVersion}
        show={!!selectedInstall}
        onClose={() => setSelectedInstall(undefined)}
      />
    </div>
  );
};

export default CatalogPanel;
