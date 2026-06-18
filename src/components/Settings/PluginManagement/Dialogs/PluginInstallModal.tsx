import React from 'react';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import ShokoMarkdown from '@/components/ShokoMarkdown';
import { useInstallPluginPackageMutation } from '@/core/react-query/plugin-package/mutations';
import toast from '@/core/toast';

import type { PackageReleaseInfoType } from '@/core/types/api/plugin-package';

type PackageType = {
  Manifest: {
    Name: string;
  };
  Release: PackageReleaseInfoType;
};

type Props = {
  show: boolean;
  onClose: () => void;
  oldPackage?: PackageType;
  newPackage: PackageType;
  packageId: string;
};

const PluginInstallModal = (props: Props) => {
  const { newPackage, oldPackage, onClose, packageId, show } = props;

  const { isPending: isInstallPending, mutate: installPlugin } = useInstallPluginPackageMutation();

  const handleInstall = () => {
    if (!newPackage) return;
    installPlugin({ packageId, releaseVersion: newPackage.Release.Version }, {
      onSuccess: () => {
        toast.success(
          `Plugin ${oldPackage ? 'upgraded' : 'installed'}`,
          `${newPackage.Manifest.Name} ${newPackage.Release.Version}`,
        );
        onClose();
      },
      onError: () =>
        toast.error(
          `Failed to ${oldPackage ? 'upgrade' : 'install'} plugin`,
          `${newPackage.Manifest.Name} ${newPackage.Release.Version}`,
        ),
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="md"
      header={`${oldPackage ? 'Upgrade' : 'Install'} ${newPackage.Manifest.Name ?? 'Plugin'}`}
      footer={
        <div className="flex justify-end gap-x-2">
          <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
            Cancel
          </Button>

          <Button
            buttonType="primary"
            buttonSize="normal"
            onClick={handleInstall}
            loading={isInstallPending}
          >
            {oldPackage ? 'Upgrade' : 'Install'}
          </Button>
        </div>
      }
    >
      <div className="grid w-74 grid-cols-2">
        {oldPackage && (
          <>
            Current Version:
            <div className="font-bold">
              {oldPackage.Release.Version}
              {oldPackage.Release.Channel === 'Dev' && ' (Dev)'}
            </div>
          </>
        )}
        {oldPackage ? 'Latest Version:' : 'Version:'}
        <div className="font-bold">
          {newPackage.Release.Version}
          {newPackage.Release.Channel === 'Dev' && ' (Dev)'}
        </div>
      </div>

      <div className="flex flex-col gap-y-6 overflow-auto rounded-lg border border-panel-border bg-panel-input p-4">
        <ShokoMarkdown>
          {newPackage.Release.ReleaseNotes ?? 'No release notes available'}
        </ShokoMarkdown>
      </div>
    </ModalPanel>
  );
};

export default PluginInstallModal;
