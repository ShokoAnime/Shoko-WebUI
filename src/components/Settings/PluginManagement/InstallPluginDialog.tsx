import React, { useMemo } from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import ShokoMarkdown from '@/components/ShokoMarkdown';
import toast from '@/components/Toast';
import { getPackageInstallArgs, getReleaseKey } from '@/core/react-query/plugin-package/helpers';
import { useInstallPluginPackageMutation } from '@/core/react-query/plugin-package/mutations';

import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
} from '@/core/react-query/plugin-package/types';

type Props = {
  entry?: PluginPackageCatalogEntryType;
  currentVersion?: string;
  initialRelease?: PluginPackageCatalogReleaseType;
  show: boolean;
  onClose: () => void;
};

const releaseHasCompatibleArchive = (release: PluginPackageCatalogReleaseType) =>
  release.Archives.some(archive => archive.IsCompatible);

const getPreferredArchive = (release?: PluginPackageCatalogReleaseType) =>
  release?.Archives.find(archive => archive.IsCompatible) ?? release?.Archives[0];

const InstallPluginDialog = ({ currentVersion, entry, initialRelease, onClose, show }: Props) => {
  const { mutate: installPlugin, status } = useInstallPluginPackageMutation();

  const selectedRelease = useMemo<PluginPackageCatalogReleaseType | undefined>(
    () =>
      entry?.Releases.find(release => initialRelease && getReleaseKey(release) === getReleaseKey(initialRelease))
        ?? entry?.Releases.find(releaseHasCompatibleArchive)
        ?? entry?.Releases[0],
    [entry, initialRelease],
  );

  const selectedArchive = useMemo<PluginPackageCatalogArchiveType | undefined>(
    () => getPreferredArchive(selectedRelease),
    [selectedRelease],
  );
  const selectedReleaseLabel = selectedRelease
    ? `${selectedRelease.Version} (${selectedRelease.Channel})`
    : '';
  const isUpgrade = !!currentVersion && !!selectedRelease;
  const releaseNotes = selectedRelease?.ReleaseNotes ?? 'No release notes available!';

  const canInstall = !!entry
    && !!selectedRelease
    && !!selectedArchive
    && selectedArchive.IsCompatible
    && !selectedRelease.IsInstalled;

  const handleInstall = () => {
    if (!entry || !selectedArchive || !selectedRelease) return;

    installPlugin(getPackageInstallArgs(entry.PackageID, selectedRelease, selectedArchive), {
      onSuccess: () => {
        toast.success('Plugin installed', `${entry.Name} ${selectedRelease.Version} installed successfully.`);
        onClose();
      },
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="md"
      header={entry ? `Install ${entry.Name}` : 'Install Plugin'}
      footer={
        <div className="flex justify-end gap-x-3">
          <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            onClick={handleInstall}
            loading={status === 'pending'}
            disabled={!canInstall}
          >
            Install
          </Button>
        </div>
      }
    >
      {entry && selectedRelease && (
        <>
          <div className="grid w-74 grid-cols-2">
            {isUpgrade
              ? (
                <>
                  <div>Current Version:</div>
                  <div className="font-bold">{currentVersion}</div>
                  <div>Latest Version:</div>
                </>
              )
              : <div>Version:</div>}
            <div className="font-bold">{selectedReleaseLabel}</div>
          </div>
          <div className="flex flex-col gap-y-6 rounded-lg border border-panel-border bg-panel-input p-4">
            <ShokoMarkdown>
              {releaseNotes}
            </ShokoMarkdown>
          </div>
        </>
      )}

      {entry && selectedRelease?.IsInstalled && (
        <div className="rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 text-sm">
          This version is already installed.
        </div>
      )}

      {entry && !selectedRelease?.IsInstalled && !selectedArchive?.IsCompatible && (
        <div className="rounded-lg border border-button-danger-border bg-panel-background-alt px-4 py-3 text-sm text-button-danger-text">
          This version is not compatible with the current server.
        </div>
      )}
    </ModalPanel>
  );
};

export default InstallPluginDialog;
