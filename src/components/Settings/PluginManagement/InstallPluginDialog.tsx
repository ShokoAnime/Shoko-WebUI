import React, { useEffect, useMemo, useState } from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { getPackageInstallArgs } from '@/core/react-query/plugin-package/helpers';
import { useInstallPluginPackageMutation } from '@/core/react-query/plugin-package/mutations';

import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
} from '@/core/react-query/plugin-package/types';

type Props = {
  entry?: PluginPackageCatalogEntryType;
  initialReleaseVersion?: string;
  show: boolean;
  onClose: () => void;
};

const releaseHasCompatibleArchive = (release: PluginPackageCatalogReleaseType) =>
  release.Archives.some(archive => archive.IsCompatible);

const getPreferredArchive = (release?: PluginPackageCatalogReleaseType) =>
  release?.Archives.find(archive => archive.IsCompatible) ?? release?.Archives[0];

const InstallPluginDialog = ({ entry, initialReleaseVersion, onClose, show }: Props) => {
  const { mutate: installPlugin, status } = useInstallPluginPackageMutation();
  const [selectedReleaseVersion, setSelectedReleaseVersion] = useState('');

  useEffect(() => {
    if (!entry || !show) return;

    const preferredRelease = entry.Releases.find(release => release.Version === initialReleaseVersion)
      ?? entry.Releases.find(releaseHasCompatibleArchive)
      ?? entry.Releases[0];

    setSelectedReleaseVersion(preferredRelease?.Version ?? '');
  }, [entry, initialReleaseVersion, show]);

  const selectedRelease = useMemo<PluginPackageCatalogReleaseType | undefined>(
    () => entry?.Releases.find(release => release.Version === selectedReleaseVersion),
    [entry, selectedReleaseVersion],
  );

  const selectedArchive = useMemo<PluginPackageCatalogArchiveType | undefined>(
    () => getPreferredArchive(selectedRelease),
    [selectedRelease],
  );

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
      {!entry
        ? null
        : (
          <div className="flex flex-col gap-y-4 pb-6">
            <div>{entry.Overview}</div>

            <div className="flex flex-col gap-y-2">
              <div className="text-base font-semibold">Version</div>
              <div className="flex flex-wrap gap-2">
                {entry.Releases.map(release => (
                  <Button
                    key={release.Version}
                    buttonType={selectedReleaseVersion === release.Version ? 'primary' : 'secondary'}
                    buttonSize="small"
                    onClick={() => setSelectedReleaseVersion(release.Version)}
                  >
                    {release.Version}
                  </Button>
                ))}
              </div>
            </div>

            {selectedRelease?.IsInstalled && (
              <div className="rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3 text-sm">
                This version is already installed.
              </div>
            )}

            {!selectedRelease?.IsInstalled && !selectedArchive?.IsCompatible && (
              <div className="rounded-lg border border-button-danger-border bg-panel-background-alt px-4 py-3 text-sm text-button-danger-text">
                This version is not compatible with the current server.
              </div>
            )}
          </div>
        )}
    </ModalPanel>
  );
};

export default InstallPluginDialog;
